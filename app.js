import express  from "express";
import path     from "path";
import fs       from "fs";
import crypto   from "crypto";
import session  from "express-session";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname  = path.dirname(__filename);

const app  = express();
const PORT = process.env.PORT || 3000;

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.use('/quill', express.static(path.join(__dirname, "node_modules", "quill", "dist")));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

app.use(
  session({
    name: "sid",
    secret:
      process.env.SESSION_SECRET ||
      crypto.randomBytes(32).toString("hex"),
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 1000 * 60 * 60
    }
  })
);

const routesDir = path.join(__dirname, "routes");
for (const file of fs.readdirSync(routesDir)) {
  if (!file.endsWith(".route.js")) continue;
  const { default: router } = await import(path.join(routesDir, file));
  app.use(router);                              
  console.log(`√ routes/${file} mounted`);
}

app.use((_req, res) => res.status(404).render("404"));

app.listen(PORT, () =>
  console.log(`Server running at http://localhost:${PORT}`)
);
