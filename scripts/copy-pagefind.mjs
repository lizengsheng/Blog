import { cpSync, existsSync, rmSync } from "node:fs";
import { resolve } from "node:path";

const source = resolve("dist/pagefind");
const destination = resolve("public/pagefind");

if (!existsSync(source)) {
  throw new Error(`Pagefind output does not exist: ${source}`);
}

rmSync(destination, { recursive: true, force: true });
cpSync(source, destination, { recursive: true });
