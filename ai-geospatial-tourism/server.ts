import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { initDatabase } from "./server/database";
import setupRoutes from "./server/routes";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Initialize Database and Seed Data
  initDatabase();

  // Middleware
  app.use(express.json());

  // Setup API Routes
  setupRoutes(app);

  // Vite middleware for development or Static files for production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
