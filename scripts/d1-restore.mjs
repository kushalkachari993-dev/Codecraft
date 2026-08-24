import { existsSync } from "node:fs";
import { extname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const argumentsList = process.argv.slice(2);
const local = argumentsList.includes("--local");
const confirmed = argumentsList.includes("--confirm-restore");
const positionals = argumentsList.filter((argument) => !argument.startsWith("--"));
const database = positionals[0] || process.env.CODECRAFT_D1_DATABASE;
const input = positionals[1] ? resolve(positionals[1]) : null;

if (!confirmed) {
  console.error("Restore changes database state. Re-run with --confirm-restore after verifying the target and backup.");
  process.exit(1);
}
if (!database || !/^[a-zA-Z0-9_-]+$/.test(database)) {
  console.error("Set CODECRAFT_D1_DATABASE or pass a valid D1 database name as the first argument.");
  process.exit(1);
}
if (!input || !existsSync(input) || extname(input).toLowerCase() !== ".sql") {
  console.error("Pass an existing .sql backup as the second argument.");
  process.exit(1);
}

console.info(`Restoring ${input} to ${local ? "local" : "remote"} D1 database ${database}...`);
const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const result = spawnSync(process.execPath, [
  wranglerCli,
  "d1",
  "execute",
  database,
  local ? "--local" : "--remote",
  "--file",
  input,
], { stdio: "inherit", shell: false });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
console.info("D1 restore completed.");
