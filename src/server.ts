import express from "express";
import helmet from "helmet";
import path from "path";
import http from "http";
import { WebSocketServer } from "ws";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import indexRoutes from "./routes/index.js";
import { resolveScriptSafe, runShellScript } from "./utils/scriptRunner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// セキュリティヘッダ（開発中に HSTS は不要）
app.use(helmet({
  hsts: false,
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'"],
      "img-src": ["'self'"],
      "style-src": ["'self' 'unsafe-inline'"]
    }
  }
}));

// 静的・ビュー
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// ルーティング
app.use(indexRoutes);

// エラーハンドラ
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const server = http.createServer(app);

// ---- WebSocket: /ws/exec?script=xxx.sh ----
const wss = new WebSocketServer({ server, path: "/ws/exec" });

// 同一オリジン制限（ALLOWED_ORIGINS）
function isOriginAllowed(origin?: string): boolean {
  if (!origin) return false;
  return config.allowedOrigins.includes(origin);
}

wss.on("connection", (ws, req) => {
  const origin = req.headers.origin as string | undefined;
  if (!isOriginAllowed(origin)) {
    ws.send("[error] Origin not allowed");
    ws.close();
    return;
  }

  const url = new URL(req.url ?? "", "http://localhost");
  const scriptName = url.searchParams.get("script");
  if (!scriptName) {
    ws.send("[error] script query is required");
    ws.close();
    return;
  }

  let fullPath: string;
  try {
    fullPath = resolveScriptSafe(config.scriptsDir, scriptName);
  } catch (e: any) {
    ws.send(`[error] ${e.message}`);
    ws.close();
    return;
  }

  const proc = runShellScript(fullPath);

  proc.stdout.on("data", (chunk) => ws.send(chunk.toString()));
  proc.stderr.on("data", (chunk) => ws.send(chunk.toString()));
  proc.on("close", (code) => {
    ws.send(`\n[process exited with code ${code}]\n`);
    ws.close();
  });

  ws.on("close", () => {
    if (!proc.killed) proc.kill("SIGTERM");
  });
});

server.listen(config.port, () => {
  console.log(`Server on http://0.0.0.0:${config.port}`);
  console.log(`Allowed Origins: ${config.allowedOrigins.join(", ")}`);
});
