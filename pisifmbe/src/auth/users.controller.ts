// src/auth/users.controller.ts
import { Router, Request, Response } from "express";
import { 
  getAllUsers, 
  createUserInDb, 
  updateUserInDb, 
  deleteUserFromDb,
  getUserById 
} from "./auth.service";
import { authMiddleware, requireRole } from "./auth.middleware";

const router = Router();

// All routes require authentication and ADMINISTRATOR role
router.use(authMiddleware);
router.use(requireRole("ADMINISTRATOR"));

// GET /api/users - Get all users
router.get("/", async (_req: Request, res: Response) => {
  try {
    const users = await getAllUsers();
    res.json(users);
  } catch (error) {
    console.error("Get users error:", error);
    res.status(500).json({ error: "Failed to fetch users" });
  }
});

// GET /api/users/:id - Get single user
router.get("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const user = await getUserById(id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const { passwordHash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Failed to fetch user" });
  }
});

// POST /api/users - Create new user
router.post("/", async (req: Request, res: Response) => {
  try {
    const { username, corporateId, password, name, role, plantAccess } = req.body;

    if (!username || !corporateId || !password || !name || !role) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const user = await createUserInDb({
      username,
      corporateId,
      password,
      name,
      role,
      plantAccess: plantAccess || [],
    });

    res.status(201).json(user);
  } catch (error: any) {
    console.error("Create user error:", error);
    if (error.code === "23505") {
      if (error.constraint?.includes("corporate_id")) {
        return res.status(400).json({ error: "Corporate ID already exists" });
      }
      return res.status(400).json({ error: "Username already exists" });
    }
    res.status(500).json({ error: "Failed to create user" });
  }
});

// PUT /api/users/:id - Update user
router.put("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    const { name, corporateId, password, role, plantAccess, isActive } = req.body;
    
    console.log(`Updating user ${id}:`, { name, corporateId, role, plantAccess, hasPassword: !!password });

    const user = await updateUserInDb(id, {
      name,
      corporateId,
      password: password || undefined,
      role,
      plantAccess,
      isActive,
    });

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json(user);
  } catch (error: any) {
    console.error("Update user error:", error);
    if (error.code === "23505" && error.constraint?.includes("corporate_id")) {
      return res.status(400).json({ error: "Corporate ID already exists" });
    }
    res.status(500).json({ error: error.message || "Failed to update user" });
  }
});

// DELETE /api/users/:id - Delete user
router.delete("/:id", async (req: Request, res: Response) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ error: "Invalid user ID" });
    }

    // Prevent deleting the main admin
    const user = await getUserById(id);
    if (user?.username === "admin") {
      return res.status(403).json({ error: "Cannot delete the main admin account" });
    }

    const deleted = await deleteUserFromDb(id);
    if (!deleted) {
      return res.status(404).json({ error: "User not found" });
    }

    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

export default router;
