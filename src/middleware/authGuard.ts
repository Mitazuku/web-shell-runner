import { Request, Response, NextFunction } from "express";

export function authGuard(req: Request, res: Response, next: NextFunction) {
  if (req.session.isAuthenticated) return next();
  return res.redirect("/login");
}
