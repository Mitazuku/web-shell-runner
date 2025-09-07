import { Router } from "express";
import { config } from "../config.js";
import { listShellScripts } from "../utils/scriptRunner.js";

const router = Router();

router.get("/", async (_req, res, next) => {
  try {
    const scripts = await listShellScripts(config.scriptsDir);
    res.render("dashboard", { title: "Web Shell Runner", scripts });
  } catch (e) {
    next(e);
  }
});

export default router;
