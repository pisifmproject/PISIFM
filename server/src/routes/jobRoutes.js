const express = require("express");
const router = express.Router();
const jobController = require("../controllers/jobController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, jobController.getAll);
router.get("/:id", authMiddleware, jobController.getById);
router.post("/", authMiddleware, jobController.create);
router.put("/:id", authMiddleware, jobController.update);
router.delete("/:id", authMiddleware, jobController.delete);

module.exports = router;
