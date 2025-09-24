import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "..", "data", "data.db");

const db = new Database(DB_PATH);
const router = express.Router();

router.get("/search", (req, res) => {
  const q = (req.query.q || "").trim().toLowerCase();

  let results = db
    .prepare(
      `SELECT page_id, title, description, category, content FROM pages`
    )
    .all();

  if (q) {
    results = results.filter((p) => {
      return (
        (p.title && p.title.toLowerCase().includes(q)) ||
        (p.names && p.names.toLowerCase().includes(q)) ||
        (p.description && p.description.toLowerCase().includes(q)) ||
        (p.category && p.category.toLowerCase().includes(q)) ||
        (p.content && p.content.toLowerCase().includes(q))
      );
    });
  }

  results.sort((a, b) =>
    a.title.localeCompare(b.title, "en", { sensitivity: "base" })
  );

  res.render("search", { q, results });
});

export default router;
