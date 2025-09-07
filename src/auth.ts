import bcrypt from "bcrypt";
import { Request, Response } from "express";
import { config } from "./config.js";

export async function verifyPassword(plain: string): Promise<boolean> {
  if (!config.adminPasswordHash) return false;
  try {
    return await bcrypt.compare(plain, config.adminPasswordHash);
  } catch {
    return false;
  }
}

export function loginHandler() {
  return async (req: Request, res: Response) => {
    const { password } = req.body as { password?: string };
    if (!password) {
      return res.status(400).render("login", { error: "パスワードを入力してください", csrfToken: req.csrfToken() });
    }
    if (await verifyPassword(password)) {
      req.session.isAuthenticated = true;
      return res.redirect("/");
    }
    return res.status(401).render("login", { error: "認証に失敗しました", csrfToken: req.csrfToken() });
  };
}

export function logoutHandler() {
  return (req: Request, res: Response) => {
    req.session.destroy(() => {
      res.redirect("/login");
    });
  };
}
