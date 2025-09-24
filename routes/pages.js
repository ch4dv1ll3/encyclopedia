import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, "..", "data", "data.db");
const db = new Database(DB_PATH);

const pages = new Map();

function loadDB() {
  pages.clear();

  const rows = db
    .prepare("SELECT page_id, category, title, description, content FROM pages")
    .all();

  for (const row of rows) {
    const { page_id, category, names, title, description, content } = row;
    if (page_id) {
      pages.set(page_id, { category, names, title, description, content });
    }
  }

  console.log(`Loaded ${pages.size} pages from data.db`);
}

loadDB();

export default pages;
