import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import { join } from "path";
import { existsSync, mkdirSync } from "fs";
import authRoutes from "./api/auth.js";
import mediaRoutes from "./api/media.js";
import relationshipRoutes from "./api/relationships.js";

const app = express();
const PORT = process.env.PORT || 3000;

// Ensure data directories exist
const dataDir = join(process.cwd(), "data");
const requiredDirs = [
  "media",
  "items",
  "relationships",
  "relationships/links",
  "ai",
];

for (const dir of requiredDirs) {
  const fullPath = join(dataDir, dir);
  if (!existsSync(fullPath)) {
    mkdirSync(fullPath, { recursive: true });
  }
}

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Disable for development
  })
);
app.use(compression());
app.use(
  cors({
    origin:
      process.env.NODE_ENV === "production"
        ? false
        : [
            process.env.FRONTEND_URL || "http://localhost:5173",
            process.env.API_URL || "http://localhost:3000",
          ],
    credentials: true,
  })
);
app.use(express.json({ limit: process.env.MAX_FILE_SIZE || "100MB" }));
app.use(
  express.urlencoded({
    extended: true,
    limit: process.env.MAX_FILE_SIZE || "100MB",
  })
);

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    version: "1.0.0",
  });
});

// API status endpoint
app.get("/api/status", (req, res) => {
  res.json({
    api: "Elephant Knowledge Base",
    version: "1.0.0",
    status: "running",
    timestamp: new Date().toISOString(),
    endpoints: [
      "GET /health",
      "GET /api/status",
      "POST /api/auth/login",
      "GET /api/media",
      "POST /api/media/upload",
      "GET /api/relationships",
      "POST /api/relationships",
    ],
  });
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/relationships", relationshipRoutes);

// Serve static files from data/media directory
app.use("/media", express.static(join(dataDir, "media")));

// Basic error handling middleware
app.use(
  (
    error: Error,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error("Server error:", error);
    res.status(500).json({
      error: "Internal server error",
      message:
        process.env.NODE_ENV === "development"
          ? error.message
          : "Something went wrong",
    });
  }
);

// Handle 404
app.use("*", (req, res) => {
  res.status(404).json({
    error: "Not found",
    message: `Route ${req.originalUrl} not found`,
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🐘 Elephant server running on port ${PORT}`);
  console.log(`📁 Data directory: ${dataDir}`);
  console.log(`🌍 Environment: ${process.env.NODE_ENV || "development"}`);
});

export default app;
