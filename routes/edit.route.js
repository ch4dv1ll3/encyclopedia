import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_PATH = path.join(__dirname, "..", "data", "data.db");

const db = new Database(DB_PATH);
const router = express.Router();

router.get("/:page_id/edit", (req, res) => {
  if (!req.session?.user) return res.status(404).render("404");

  const row = db
    .prepare("SELECT * FROM pages WHERE page_id = ?")
    .get(req.params.page_id) || {
      title: "",
      names: "",
      category: "",
      description: "",
      content: ""
    };

  res.render("edit", {
    page_id: req.params.page_id,
    ...row
  });
});

router.post(
  "/:page_id/edit",
  express.urlencoded({ extended: false }),
  (req, res) => {
    if (!req.session?.user) return res.status(404).render("404");

    const page_id = req.params.page_id;
    const { category, title, names, description, content } = req.body;

    db.prepare(`
      INSERT INTO pages (page_id, category, names, title, description, content)
      VALUES (?, ?, ?, ?, ?, ?)
      ON CONFLICT(page_id)
      DO UPDATE SET
        category = excluded.category,
        names = excluded.names,
        title = excluded.title,
        description = excluded.description,
        content = excluded.content
    `).run(page_id, category, names, title, description, content);

    res.redirect("/" + page_id);
  }
);

export default router;
