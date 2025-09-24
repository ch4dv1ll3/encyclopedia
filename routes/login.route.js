import fs from "fs";
import path from "path";
import { parse } from "csv-parse/sync";
import bcrypt from "bcryptjs";
import express from "express";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);
const router = express.Router();

const CSV_PATH = path.join(__dirname, "..", "data", "accounts.csv");
const rows = parse(fs.readFileSync(CSV_PATH), { columns: true });
const ACCOUNTS = new Map(rows.map(r => [r.username, r.password_hash]));

router.get("/login", (req, res) => {
  if (req.session.user) return res.redirect("/");
  res.render("login", { error: null });
});

router.post(
  "/login",
  express.urlencoded({ extended: false }),
  (req, res) => {
    const { username, password } = req.body;
    const hash = ACCOUNTS.get(username);
    if (!hash || !bcrypt.compareSync(password, hash)) {
      return res.status(401).render("login", { error: "Invalid credentials." });
    }

    req.session.user = username;
    res.redirect("/");
  }
);

router.get("/logout", (req, res) => {
  req.session.destroy(() => res.redirect("/login"));
});

export default router;
