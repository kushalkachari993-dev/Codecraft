import { spawn } from "node:child_process";
import { mkdir, rm, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

try {
  process.loadEnvFile?.(".env.local");
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

const port = process.env.CODECRAFT_E2E_PORT ?? "4173";
const stateDirectory = resolve(".wrangler/e2e");
const runtimeEnvironmentFile = resolve(".wrangler/e2e-runtime.env");
const publishableKey = process.env.VITE_CLERK_PUBLISHABLE_KEY
  ?? process.env.CLERK_PUBLISHABLE_KEY
  ?? "pk_test_Y2xlcmsuYWNjb3VudHMuZGV2JA";
const runtimeEntries = [
  ["VITE_CLERK_PUBLISHABLE_KEY", publishableKey],
  ["CLERK_SECRET_KEY", process.env.CLERK_SECRET_KEY],
];

await mkdir(resolve(".wrangler"), { recursive: true });
await writeFile(
  runtimeEnvironmentFile,
  runtimeEntries
    .filter((entry) => Boolean(entry[1]))
    .map(([key, value]) => `${key}=${JSON.stringify(value)}`)
    .join("\n"),
  { encoding: "utf8", mode: 0o600 },
);

const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const child = spawn(process.execPath, [
  wranglerCli,
  "dev",
  "--config",
  "dist/server/wrangler.json",
  "--local",
  "--port",
  port,
  "--persist-to",
  stateDirectory,
  "--env-file",
  runtimeEnvironmentFile,
], {
  stdio: "inherit",
  env: {
    ...process.env,
    WRANGLER_LOG_PATH: ".wrangler/e2e-wrangler.log",
  },
});

let closing = false;
const close = async (code = 0) => {
  if (closing) return;
  closing = true;
  await rm(runtimeEnvironmentFile, { force: true });
  process.exit(code);
};

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => child.kill(signal));
}

child.on("error", async (error) => {
  console.error(error.message);
  await close(1);
});

child.on("exit", async (code) => {
  await close(code ?? 1);
});
