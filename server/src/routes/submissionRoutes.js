const express = require("express");
const router = express.Router();
const submissionController = require("../controllers/submissionController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, submissionController.getAll);
router.get("/:id", authMiddleware, submissionController.getById);
router.post("/", authMiddleware, submissionController.create);
router.put("/:id", authMiddleware, submissionController.update);
router.delete("/:id", authMiddleware, submissionController.delete);

module.exports = router;
