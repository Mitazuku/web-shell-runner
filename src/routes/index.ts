import { Router } from "express";
import { authGuard } from "../middleware/authGuard.js";
import { listShellScripts } from "../utils/scriptRunner.js";
import { config } from "../config.js";

const router = Router();

router.get("/", authGuard, async (req, res, next) => {
  try {
    const scripts = await listShellScripts(config.scriptsDir);
    res.render("dashboard", { scripts, csrfToken: req.csrfToken() });
  } catch (e) {
    next(e);
  }
});

export default router;
