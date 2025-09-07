import dotenv from "dotenv";
dotenv.config();

function parseBasicUsers(src: string | undefined) {
  const list = (src || "").split(",").map(s => s.trim()).filter(Boolean);
  return list.map(pair => {
    const i = pair.indexOf(":");
    if (i < 0) return null;
    const user = pair.slice(0, i);
    const pass = pair.slice(i + 1);
    if (!user || !pass) return null;
    return { user, pass };
  }).filter((v): v is { user: string; pass: string } => !!v);
}

export const config = {
  port: parseInt(process.env.PORT || "8686", 10),
  scriptsDir: process.env.SCRIPTS_DIR || "./scripts",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:8686")
    .split(",").map(s => s.trim()).filter(Boolean),
  basicUsers: parseBasicUsers(process.env.BASIC_USERS),
};
