import { Router } from "express";
import { loginHandler, logoutHandler } from "../auth.js";

const router = Router();

router.get("/login", (req, res) => {
  res.render("login", { error: null, csrfToken: req.csrfToken() });
});

router.post("/login", loginHandler());
router.post("/logout", logoutHandler());

export default router;
