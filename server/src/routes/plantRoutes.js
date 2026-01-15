const express = require("express");
const router = express.Router();
const plantController = require("../controllers/plantController");
const { authMiddleware } = require("../middleware/authMiddleware");

router.get("/", authMiddleware, plantController.getAll);
router.get("/:id", authMiddleware, plantController.getById);
router.post("/", authMiddleware, plantController.create);
router.put("/:id", authMiddleware, plantController.update);
router.delete("/:id", authMiddleware, plantController.delete);

module.exports = router;
