import dotenv from "dotenv";
dotenv.config();

export const config = {
  port: parseInt(process.env.PORT || "8686", 10),
  sessionSecret: process.env.SESSION_SECRET || "change-me",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH || "",
  scriptsDir: process.env.SCRIPTS_DIR || "./scripts"
};
