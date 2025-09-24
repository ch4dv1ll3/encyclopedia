import express from "express";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "..", "data", "data.db");

const db = new Database(DB_PATH);
const router = express.Router();

function escapeHtml(str = "") {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function markdownToHtml(str = "") {
  return str
    .replace(/^### (.*)$/gm, "<h3>$1</h3>")
    .replace(/^## (.*)$/gm, "<h2>$1</h2>")
    .replace(/^# (.*)$/gm, "<h1>$1</h1>")
    .replace(/^---$/gm, "<hr>")
    .replace(/\*\*\*(.+?)\*\*\*/g, "<b><i>$1</i></b>")
    .replace(/\*\*(.+?)\*\*/g, "<b>$1</b>")
    .replace(/\*(.+?)\*/g, "<i>$1</i>")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="/$2">$1</a>') 
    .replace(/^((?!<h\d|<hr).+)$/gm, "<p>$1</p>");
}

router.get("/:page_id", (req, res, next) => {
  const page_id = req.params.page_id;

  const page = db
    .prepare("SELECT * FROM pages WHERE page_id = ?")
    .get(page_id);

  if (!page) return next();

  const safeInput = escapeHtml(page.content);

  const content = markdownToHtml(safeInput);

  res.render("page", {
    page_id,
    ...page,
    content,
  });
});

export default router;
