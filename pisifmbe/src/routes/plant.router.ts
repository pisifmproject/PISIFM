// src/routes/plant.router.ts
// Plant-specific dashboard and endpoints

import { Router } from "express";
import { validatePlantId } from "../shared/middleware/plantValidator";
import * as plantService from "../shared/services/plant.service";
import { PlantId } from "../shared/types/plant.types";

const router = Router();

/**
 * GET /api/plants/:plantId/dashboard
 * Plant at-a-glance summary
 */
router.get("/:plantId/dashboard", validatePlantId, async (req, res) => {
  try {
    const { plantId } = req.params as { plantId: PlantId };
    const plant = await plantService.getPlantById(plantId);

    if (!plant) {
      return res.status(404).json({
        success: false,
        message: `Plant not found: ${plantId}`,
      });
    }

    const machines = await plantService.getMachinesByPlant(plantId);

    // Build dashboard data
    // For Cikupa with real data, we'll fetch real metrics
    // For others, return structured dummy data
    const isDummyPlant = !plant.hasRealData;

    const dashboardData = {
      plant: {
        plantId: plant.plantId,
        displayName: plant.displayName,
        location: plant.location,
        status: plant.status,
      },
      summary: {
        totalEnergyToday: isDummyPlant
          ? Math.round((plant.installedCapacityKva || 3000) * 16 * (0.6 + Math.random() * 0.2))
          : 12500, // TODO: Real data for Cikupa
        utilizationPercent: isDummyPlant ? 55 + Math.random() * 25 : 68,
        activeAlarms: isDummyPlant ? Math.floor(Math.random() * 5) : 2,
        activeMachines: machines.filter((m) => m.status === "active").length,
        totalMachines: machines.length,
      },
      utilities: {
        electricity: {
          current: isDummyPlant ? 2500 + Math.random() * 1000 : 3200,
          target: isDummyPlant ? 3500 : 4000,
          unit: "kW",
        },
        steam: {
          current: isDummyPlant ? 1200 + Math.random() * 400 : 1500,
          target: isDummyPlant ? 1800 : 2000,
          unit: "kg/h",
        },
        water: {
          current: isDummyPlant ? 80 + Math.random() * 30 : 95,
          target: isDummyPlant ? 120 : 150,
          unit: "m³/h",
        },
        compressedAir: {
          current: isDummyPlant ? 150 + Math.random() * 50 : 180,
          target: isDummyPlant ? 220 : 250,
          unit: "m³/h",
        },
        nitrogen: {
          current: isDummyPlant ? 20 + Math.random() * 10 : 25,
          target: isDummyPlant ? 35 : 40,
          unit: "m³/h",
        },
        gas: {
          current: isDummyPlant ? 40 + Math.random() * 15 : 50,
          target: isDummyPlant ? 65 : 75,
          unit: "m³/h",
        },
      },
      shiftPerformance: {
        shift1: {
          production: isDummyPlant ? 850 + Math.random() * 100 : 920,
          target: 1000,
          efficiency: isDummyPlant ? 85 + Math.random() * 10 : 92,
        },
        shift2: {
          production: isDummyPlant ? 880 + Math.random() * 100 : 950,
          target: 1000,
          efficiency: isDummyPlant ? 88 + Math.random() * 10 : 95,
        },
        shift3: {
          production: isDummyPlant ? 820 + Math.random() * 100 : 890,
          target: 1000,
          efficiency: isDummyPlant ? 82 + Math.random() * 10 : 89,
        },
      },
      activeAlarms: isDummyPlant
        ? [
            {
              id: `alarm-${plantId}-1`,
              severity: "warning",
              message: "Temperature slightly elevated on Line 2",
              timestamp: new Date(Date.now() - 3600000),
            },
            {
              id: `alarm-${plantId}-2`,
              severity: "info",
              message: "Scheduled maintenance due in 24 hours",
              timestamp: new Date(Date.now() - 7200000),
            },
          ]
        : [
            {
              id: "alarm-cikupa-1",
              severity: "warning",
              message: "LVMDP 3 voltage fluctuation detected",
              timestamp: new Date(Date.now() - 1800000),
            },
            {
              id: "alarm-cikupa-2",
              severity: "info",
              message: "PC 39 maintenance scheduled",
              timestamp: new Date(Date.now() - 5400000),
            },
          ],
      productionLines: machines
        .filter((m) => m.machineType === "production")
        .map((m) => ({
          machineId: m.machineId,
          machineName: m.machineName,
          status: isDummyPlant
            ? Math.random() > 0.2
              ? "running"
              : "idle"
            : "running",
          oee: isDummyPlant ? 75 + Math.random() * 20 : 85 + Math.random() * 10,
          currentProduction: isDummyPlant
            ? Math.round(800 + Math.random() * 200)
            : Math.round(900 + Math.random() * 100),
          targetProduction: 1000,
        })),
      packingLines: machines
        .filter((m) => m.machineType === "packing")
        .map((m) => ({
          machineId: m.machineId,
          machineName: m.machineName,
          status: isDummyPlant
            ? Math.random() > 0.2
              ? "running"
              : "idle"
            : "running",
          efficiency: isDummyPlant ? 70 + Math.random() * 25 : 80 + Math.random() * 15,
          currentPacks: isDummyPlant
            ? Math.round(700 + Math.random() * 250)
            : Math.round(850 + Math.random() * 150),
          targetPacks: 1000,
        })),
      lastUpdated: new Date(),
    };

    res.json({
      success: true,
      data: dashboardData,
    });
  } catch (error: any) {
    console.error("[PLANT] Error fetching plant dashboard:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch plant dashboard",
    });
  }
});

export default router;
