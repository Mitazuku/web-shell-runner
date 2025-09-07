import { Router } from "express";
import crypto from "crypto";
import { authGuard } from "../middleware/authGuard.js";
import { config } from "../config.js";
import { resolveScriptSafe, runShellScript } from "../utils/scriptRunner.js";

type ExecRegistry = Map<string, { pid: number }>;
export const execRegistry: ExecRegistry = new Map();

const router = Router();

// 実行開始: {scriptName} を受け取り、execId を返す
router.post("/exec", authGuard, (req, res) => {
  const { scriptName } = req.body as { scriptName?: string };
  if (!scriptName) return res.status(400).json({ error: "scriptName is required" });

  let fullPath: string;
  try {
    fullPath = resolveScriptSafe(config.scriptsDir, scriptName);
  } catch (e: any) {
    return res.status(400).json({ error: e.message });
  }

  const execId = crypto.randomUUID();
  const proc = runShellScript(fullPath);

  execRegistry.set(execId, { pid: proc.pid ?? -1 });

  // NOTE: 出力はWebSocket側で配信するので、ここではIDだけ返す
  proc.on("exit", () => {
    // プロセス終了時に登録を残すか消すかは用途に応じて
    // ここでは残さず消す
    execRegistry.delete(execId);
  });

  // 一旦応答
  return res.json({ execId });
});

export default router;
