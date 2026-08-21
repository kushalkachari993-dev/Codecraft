import { copyFile, mkdir } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = dirname(dirname(fileURLToPath(import.meta.url)));
const sourceRoot = join(projectRoot, "node_modules", "pyodide");
const outputRoot = join(projectRoot, "public", "pyodide");
const runtimeFiles = [
  "pyodide.mjs",
  "pyodide.asm.mjs",
  "pyodide.asm.wasm",
  "pyodide-lock.json",
  "python_stdlib.zip",
];

await mkdir(outputRoot, { recursive: true });
await Promise.all(runtimeFiles.map((file) => copyFile(join(sourceRoot, file), join(outputRoot, file))));
