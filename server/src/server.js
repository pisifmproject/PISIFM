const express = require("express");
const cors = require("cors");
const { db } = require("./config/database");
const routes = require("./routes");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3026;

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/health", async (req, res) => {
  try {
    await db.execute("SELECT 1");
    res.json({
      status: "ok",
      message: "Server and database are running",
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
});

// API Routes
app.use("/api", routes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: process.env.NODE_ENV === "development" ? err.message : undefined,
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(
    `📊 Database: ${process.env.DATABASE_URL?.split("@")[1] || "connected"}`
  );
  console.log(`🔧 Environment: ${process.env.NODE_ENV || "development"}`);
});

module.exports = app;
