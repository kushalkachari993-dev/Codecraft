import { existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";

const argumentsList = process.argv.slice(2);
const local = argumentsList.includes("--local");
const positionals = argumentsList.filter((argument) => !argument.startsWith("--"));
const database = positionals[0] || process.env.CODECRAFT_D1_DATABASE;

if (!database || !/^[a-zA-Z0-9_-]+$/.test(database)) {
  console.error("Set CODECRAFT_D1_DATABASE or pass a valid D1 database name as the first argument.");
  process.exit(1);
}

const timestamp = new Date().toISOString().replaceAll(":", "-").replaceAll(".", "-");
const output = resolve(positionals[1] || `backups/codecraft-d1-${timestamp}.sql`);
if (existsSync(output)) {
  console.error(`Refusing to overwrite existing backup: ${output}`);
  process.exit(1);
}
mkdirSync(dirname(output), { recursive: true });

const wranglerCli = resolve("node_modules/wrangler/bin/wrangler.js");
const result = spawnSync(process.execPath, [
  wranglerCli,
  "d1",
  "export",
  database,
  local ? "--local" : "--remote",
  "--output",
  output,
], { stdio: "inherit", shell: false });

if (result.error) {
  console.error(result.error.message);
  process.exit(1);
}
if (result.status !== 0) process.exit(result.status ?? 1);
console.info(`D1 backup created at ${output}`);
