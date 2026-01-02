// src/auth/auth.controller.ts
import { Router, Request, Response } from "express";
import { login, getAllUsers } from "./auth.service";
import { authMiddleware, requireRole } from "./auth.middleware";

const router = Router();

// POST /api/auth/login
router.post("/login", async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({ error: "Username and password are required" });
    }

    const result = await login(username, password);

    if (!result.success) {
      return res.status(401).json({ error: result.message });
    }

    res.json(result);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// GET /api/auth/me - Get current user info
router.get("/me", authMiddleware, (req: Request, res: Response) => {
  res.json({ user: req.user });
});

// GET /api/auth/users - Get all users (admin only)
router.get(
  "/users",
  authMiddleware,
  requireRole("ADMINISTRATOR"),
  async (_req: Request, res: Response) => {
    try {
      const users = await getAllUsers();
      res.json({ users });
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
