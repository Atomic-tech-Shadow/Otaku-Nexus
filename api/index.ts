import express from "express";
import { setupAuth } from "../server/auth.js";
import { registerRoutes } from "../server/routes.js";

const app = express();

// Middleware de base
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuration pour Vercel (serverless)
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
  
  if (req.method === 'OPTIONS') {
    res.sendStatus(200);
  } else {
    next();
  }
});

// Configuration auth et routes
async function setupApp() {
  await setupAuth(app);
  await registerRoutes(app);
}

setupApp().catch(console.error);

// Export pour Vercel
export default app;