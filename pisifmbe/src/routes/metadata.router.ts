// src/routes/metadata.router.ts
// Routes for plant and machine metadata

import { Router } from "express";
import * as plantService from "../shared/services/plant.service";
import { validatePlantId } from "../shared/middleware/plantValidator";

const router = Router();

/**
 * GET /api/metadata/plants
 * Get all plants
 */
router.get("/plants", async (req, res) => {
  try {
    const plants = await plantService.getAllPlants();
    res.json({
      success: true,
      data: plants,
    });
  } catch (error: any) {
    console.error("[METADATA] Error fetching plants:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch plants",
    });
  }
});

/**
 * GET /api/metadata/plants/:plantId
 * Get single plant by ID
 */
router.get("/plants/:plantId", validatePlantId, async (req, res) => {
  try {
    const { plantId } = req.params;
    const plant = await plantService.getPlantById(plantId as any);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: `Plant not found: ${plantId}`,
      });
    }

    res.json({
      success: true,
      data: plant,
    });
  } catch (error: any) {
    console.error("[METADATA] Error fetching plant:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch plant",
    });
  }
});

/**
 * GET /api/metadata/plants/:plantId/machines
 * Get all machines for a plant
 */
router.get("/plants/:plantId/machines", validatePlantId, async (req, res) => {
  try {
    const { plantId } = req.params;
    const machines = await plantService.getMachinesByPlant(plantId as any);

    res.json({
      success: true,
      data: machines,
    });
  } catch (error: any) {
    console.error("[METADATA] Error fetching machines:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch machines",
    });
  }
});

/**
 * GET /api/metadata/machines
 * Get all machines across all plants
 */
router.get("/machines", async (req, res) => {
  try {
    const machines = await plantService.getAllMachines();
    res.json({
      success: true,
      data: machines,
    });
  } catch (error: any) {
    console.error("[METADATA] Error fetching all machines:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch machines",
    });
  }
});

export default router;
