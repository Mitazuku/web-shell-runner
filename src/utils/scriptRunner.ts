import { spawn, ChildProcessWithoutNullStreams } from "child_process";
import path from "path";
import fs from "fs/promises";

export type ExecProcess = {
  id: string;
  proc: ChildProcessWithoutNullStreams;
  startedAt: Date;
  scriptPath: string;
};

export async function listShellScripts(dir: string): Promise<string[]> {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  return entries
    .filter((e) => e.isFile() && e.name.endsWith(".sh"))
    .map((e) => e.name)
    .sort();
}

export function resolveScriptSafe(dir: string, name: string): string {
  // ディレクトリトラバーサル対策
  const resolved = path.resolve(dir, name);
  const root = path.resolve(dir);
  if (!resolved.startsWith(root + path.sep)) {
    throw new Error("Invalid script path");
  }
  if (!name.endsWith(".sh")) {
    throw new Error("Only .sh is allowed");
  }
  return resolved;
}

export function runShellScript(fullPath: string): ChildProcessWithoutNullStreams {
  // bash 経由で起動
  return spawn("/usr/bin/env", ["bash", fullPath], {
    cwd: path.dirname(fullPath),
    env: process.env,
  });
}
