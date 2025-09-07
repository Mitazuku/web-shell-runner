import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs/promises";

export async function listShellScripts(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".sh"))
    .map((e) => e.name)
    .sort();
}

export function resolveScriptSafe(dir: string, name: string): string {
  const resolved = path.resolve(dir, name);
  const root = path.resolve(dir);
  if (!resolved.startsWith(root + path.sep)) throw new Error("Invalid script path");
  if (!name.endsWith(".sh")) throw new Error("Only .sh is allowed");
  return resolved;
}

export function runShellScript(fullPath: string): ChildProcessWithoutNullStreams {
  return spawn("/usr/bin/env", ["bash", fullPath], {
    cwd: path.dirname(fullPath),
    env: process.env,
  });
}
