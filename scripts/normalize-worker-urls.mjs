import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const clientRoot = path.resolve("dist/client/_next/static/chunks");
const workerUrlPattern = /new URL\((["'`])(\/_next\/static\/sql-runner\.worker-[^"'`]+\.js)\1,\s*(["'`])file:\/\/\/[^"'`]+\3\)/g;
let replacements = 0;

async function visit(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const absolutePath = path.join(directory, entry.name);
    if (entry.isDirectory()) {
      await visit(absolutePath);
      continue;
    }
    if (!entry.name.endsWith(".js")) continue;

    const source = await readFile(absolutePath, "utf8");
    const normalized = source.replace(workerUrlPattern, (_match, _quote, assetPath) => {
      replacements += 1;
      return JSON.stringify(assetPath);
    });
    if (normalized !== source) await writeFile(absolutePath, normalized);
  }
}

await visit(clientRoot);
if (replacements !== 1) {
  throw new Error(`Expected to normalize one SQL worker URL, found ${replacements}.`);
}

console.log("Normalized the hosted SQL worker URL.");
