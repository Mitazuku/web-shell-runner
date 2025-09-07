import express from "express";
import session from "express-session";
import helmet from "helmet";
import path from "path";
import csrf from "csurf";
import http from "http";
import { WebSocketServer } from "ws";
import bodyParser from "body-parser";
import { fileURLToPath } from "url";
import { config } from "./config.js";
import indexRoutes from "./routes/index.js";
import authRoutes from "./routes/authRoutes.js";
import apiRoutes, { execRegistry } from "./routes/apiRoutes.js";
import { resolveScriptSafe, runShellScript } from "./utils/scriptRunner.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// セキュリティヘッダ
app.use(helmet({
  contentSecurityPolicy: {
    useDefaults: true,
    directives: {
      "script-src": ["'self'"],
      "img-src": ["'self'"],
      "style-src": ["'self' 'unsafe-inline'"]
    }
  }
}));

// 静的ファイルとビュー
app.set("views", path.join(__dirname, "..", "views"));
app.set("view engine", "ejs");
app.use("/public", express.static(path.join(__dirname, "..", "public")));

// セッション
app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    // HTTPS運用時は secure: true を推奨
  }
}));

// 解析 & CSRF
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
const csrfProtection = csrf({ cookie: false });
app.use(csrfProtection);

// ルーティング
app.use(authRoutes);
app.use(indexRoutes);
app.use("/api", apiRoutes);

// エラーハンドラ
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).send("Internal Server Error");
});

const server = http.createServer(app);

// ---- WebSocket: /ws/exec/:execId ----
const wss = new WebSocketServer({ server, path: "/ws/exec" });
// execIdごとにプロセス生成し、ここで出力を配信する仕組み
wss.on("connection", (ws, req) => {
  // 認証: セッションCookie検証までする場合は、`ws`にセッションをマッピングする実装が必要。
  // ここでは簡易化のために短命な1回の実行に限定し、クエリ文字列で受領。
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

  proc.stdout.on("data", (chunk) => {
    ws.send(chunk.toString());
  });
  proc.stderr.on("data", (chunk) => {
    ws.send(chunk.toString());
  });
  proc.on("close", (code) => {
    ws.send(`\n[process exited with code ${code}]\n`);
    ws.close();
  });

  ws.on("close", () => {
    // クライアントが閉じたらプロセスを殺す（任意）
    if (!proc.killed) {
      proc.kill("SIGTERM");
    }
  });
});

server.listen(config.port, () => {
  console.log(`Server started on http://0.0.0.0:${config.port}`);
});
