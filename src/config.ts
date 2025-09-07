import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8686", 10),
  scriptsDir: process.env.SCRIPTS_DIR || "./scripts",
  allowedOrigins: (process.env.ALLOWED_ORIGINS || "http://localhost:8686")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean),
};
