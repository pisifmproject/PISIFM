const express = require("express");
const router = express.Router();

// Import all route modules
const authRoutes = require("./authRoutes");
const userRoutes = require("./userRoutes");
const projectRoutes = require("./projectRoutes");
const submissionRoutes = require("./submissionRoutes");
const jobRoutes = require("./jobRoutes");
const plantRoutes = require("./plantRoutes");

// Mount routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/projects", projectRoutes);
router.use("/submissions", submissionRoutes);
router.use("/jobs", jobRoutes);
router.use("/plants", plantRoutes);

module.exports = router;
