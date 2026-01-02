// src/visibility/visibility.controller.ts
import { Router, Request, Response } from "express";
import { db } from "../db";
import { visibilitySettings } from "../db/schema";
import { eq, and } from "drizzle-orm";

const router = Router();

// GET /api/visibility - Get all visibility settings (all roles)
// IMPORTANT: This route must be defined BEFORE /:role to avoid conflicts
router.get("/", async (_req: Request, res: Response) => {
  try {
    const settings = await db.select().from(visibilitySettings);
    
    // Transform to nested structure: { [role]: { [scopeKey]: { [itemKey]: boolean } } }
    const result: Record<string, Record<string, Record<string, boolean>>> = {};
    for (const setting of settings) {
      if (!result[setting.role]) {
        result[setting.role] = {};
      }
      if (!result[setting.role][setting.scopeKey]) {
        result[setting.role][setting.scopeKey] = {};
      }
      result[setting.role][setting.scopeKey][setting.itemKey] = setting.visible;
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching all visibility settings:", error);
    res.status(500).json({ error: "Failed to fetch visibility settings" });
  }
});

// DELETE /api/visibility/reset - Reset all visibility settings (restore defaults)
// IMPORTANT: This route must be defined BEFORE /:role to avoid conflicts
router.delete("/reset", async (_req: Request, res: Response) => {
  try {
    await db.delete(visibilitySettings);
    res.json({ success: true, message: "All visibility settings reset to defaults" });
  } catch (error) {
    console.error("Error resetting visibility settings:", error);
    res.status(500).json({ error: "Failed to reset visibility settings" });
  }
});

// GET /api/visibility/:role - Get all visibility settings for a role
router.get("/:role", async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    
    const settings = await db
      .select()
      .from(visibilitySettings)
      .where(eq(visibilitySettings.role, role));
    
    // Transform to nested structure: { [scopeKey]: { [itemKey]: boolean } }
    const result: Record<string, Record<string, boolean>> = {};
    for (const setting of settings) {
      if (!result[setting.scopeKey]) {
        result[setting.scopeKey] = {};
      }
      result[setting.scopeKey][setting.itemKey] = setting.visible;
    }
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching visibility settings:", error);
    res.status(500).json({ error: "Failed to fetch visibility settings" });
  }
});

// PUT /api/visibility/:role - Update a single visibility setting
router.put("/:role", async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { scopeKey, itemKey, visible } = req.body;
    
    if (!scopeKey || !itemKey || typeof visible !== "boolean") {
      return res.status(400).json({ 
        error: "Missing required fields: scopeKey, itemKey, visible" 
      });
    }
    
    console.log(`Updating visibility: role=${role}, scopeKey=${scopeKey}, itemKey=${itemKey}, visible=${visible}`);
    
    // Check if setting exists
    const existing = await db
      .select()
      .from(visibilitySettings)
      .where(
        and(
          eq(visibilitySettings.role, role),
          eq(visibilitySettings.scopeKey, scopeKey),
          eq(visibilitySettings.itemKey, itemKey)
        )
      )
      .limit(1);
    
    if (existing.length > 0) {
      // Update existing
      await db
        .update(visibilitySettings)
        .set({
          visible,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(visibilitySettings.role, role),
            eq(visibilitySettings.scopeKey, scopeKey),
            eq(visibilitySettings.itemKey, itemKey)
          )
        );
    } else {
      // Insert new
      await db
        .insert(visibilitySettings)
        .values({
          role,
          scopeKey,
          itemKey,
          visible,
          updatedAt: new Date(),
        });
    }
    
    console.log(`Visibility updated successfully: ${role}/${scopeKey}/${itemKey} = ${visible}`);
    res.json({ success: true, role, scopeKey, itemKey, visible });
  } catch (error) {
    console.error("Error updating visibility setting:", error);
    res.status(500).json({ error: "Failed to update visibility setting" });
  }
});

// POST /api/visibility/:role/bulk - Bulk update visibility settings
router.post("/:role/bulk", async (req: Request, res: Response) => {
  try {
    const { role } = req.params;
    const { scopeKey, updates } = req.body;
    
    if (!scopeKey || !updates || typeof updates !== "object") {
      return res.status(400).json({ 
        error: "Missing required fields: scopeKey, updates" 
      });
    }
    
    // Process each update
    const promises = Object.entries(updates).map(async ([itemKey, visible]) => {
      // Check if setting exists
      const existing = await db
        .select()
        .from(visibilitySettings)
        .where(
          and(
            eq(visibilitySettings.role, role),
            eq(visibilitySettings.scopeKey, scopeKey),
            eq(visibilitySettings.itemKey, itemKey)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing
        return db
          .update(visibilitySettings)
          .set({
            visible: visible as boolean,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(visibilitySettings.role, role),
              eq(visibilitySettings.scopeKey, scopeKey),
              eq(visibilitySettings.itemKey, itemKey)
            )
          );
      } else {
        // Insert new
        return db
          .insert(visibilitySettings)
          .values({
            role,
            scopeKey,
            itemKey,
            visible: visible as boolean,
            updatedAt: new Date(),
          });
      }
    });
    
    await Promise.all(promises);
    
    res.json({ success: true, role, scopeKey, count: Object.keys(updates).length });
  } catch (error) {
    console.error("Error bulk updating visibility settings:", error);
    res.status(500).json({ error: "Failed to bulk update visibility settings" });
  }
});

export default router;
