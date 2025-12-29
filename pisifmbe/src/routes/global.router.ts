// src/routes/global.router.ts
// Global corporate dashboard - aggregates metrics across all plants

import { Router } from "express";
import * as plantService from "../shared/services/plant.service";

const router = Router();

/**
 * GET /api/global/dashboard
 * Global corporate summary aggregating all plants
 */
router.get("/dashboard", async (req, res) => {
  try {
    const plants = await plantService.getAllPlants();

    // Aggregate metrics across all plants
    // For now, using mock data for non-Cikupa plants
    const plantSummaries = plants.map((plant) => {
      if (plant.plantId === "cikupa" && plant.hasRealData) {
        // TODO: Fetch real aggregated data for Cikupa
        return {
          plantId: plant.plantId,
          displayName: plant.displayName,
          status: "online",
          totalEnergyToday: 12500, // kWh - placeholder, should aggregate from LVMDP
          utilizationPercent: 68,
          activeAlarms: 2,
          machineCount: 10,
        };
      } else {
        // Dummy data for other plants
        const baseEnergy = plant.installedCapacityKva * 16; // Rough estimate
        return {
          plantId: plant.plantId,
          displayName: plant.displayName,
          status: "online",
          totalEnergyToday: baseEnergy * (0.5 + Math.random() * 0.3),
          utilizationPercent: 50 + Math.random() * 30,
          activeAlarms: Math.floor(Math.random() * 5),
          machineCount: 7 + Math.floor(Math.random() * 6),
        };
      }
    });

    // Calculate totals
    const totalEnergy = plantSummaries.reduce(
      (sum, p) => sum + p.totalEnergyToday,
      0
    );
    const avgUtilization =
      plantSummaries.reduce((sum, p) => sum + p.utilizationPercent, 0) /
      plantSummaries.length;
    const totalAlarms = plantSummaries.reduce((sum, p) => sum + p.activeAlarms, 0);
    const totalMachines = plantSummaries.reduce(
      (sum, p) => sum + p.machineCount,
      0
    );

    res.json({
      success: true,
      data: {
        summary: {
          totalPlants: plants.length,
          totalEnergyToday: Math.round(totalEnergy),
          avgUtilization: Math.round(avgUtilization * 10) / 10,
          totalActiveAlarms: totalAlarms,
          totalMachines,
        },
        plants: plantSummaries,
        lastUpdated: new Date(),
      },
    });
  } catch (error: any) {
    console.error("[GLOBAL] Error fetching global dashboard:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch global dashboard",
    });
  }
});

export default router;
