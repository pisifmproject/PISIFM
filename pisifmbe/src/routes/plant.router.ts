// src/routes/plant.router.ts
// Plant-specific dashboard and endpoints
// Uses centralized dummy data generator for consistent data

import { Router } from "express";
import { validatePlantId } from "../shared/middleware/plantValidator";
import * as plantService from "../shared/services/plant.service";
import { PlantId } from "../shared/types/plant.types";
import {
  generatePlantDashboardData,
  generateMachineStatus,
  PlantId as GeneratorPlantId,
} from "../generators";

const router = Router();

/**
 * GET /api/plants/:plantId/dashboard
 * Plant at-a-glance summary with centralized dummy data
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
    const activeMachines = machines.filter((m) => m.status === "active").length;
    
    // Generate dashboard data using centralized generator
    const generatedData = generatePlantDashboardData(
      plantId as GeneratorPlantId,
      machines.length,
      activeMachines
    );

    // Build dashboard response
    const dashboardData = {
      plant: {
        plantId: plant.plantId,
        displayName: plant.displayName,
        location: plant.location,
        status: plant.status,
      },
      summary: {
        totalEnergyToday: generatedData.totalEnergyToday,
        utilizationPercent: generatedData.utilizationPercent,
        activeAlarms: generatedData.activeAlarms,
        activeMachines: generatedData.activeMachines,
        totalMachines: generatedData.totalMachines,
      },
      utilities: generatedData.utilities,
      shiftPerformance: {
        shift1: {
          production: generatedData.shifts[0].outputKg,
          target: Math.round(generatedData.shifts[0].outputKg * 1.15),
          efficiency: generatedData.shifts[0].oeePercentage,
          status: generatedData.shifts[0].status,
        },
        shift2: {
          production: generatedData.shifts[1].outputKg,
          target: Math.round(generatedData.shifts[1].outputKg * 1.15),
          efficiency: generatedData.shifts[1].oeePercentage,
          status: generatedData.shifts[1].status,
        },
        shift3: {
          production: generatedData.shifts[2].outputKg,
          target: Math.round(generatedData.shifts[2].outputKg * 1.15),
          efficiency: generatedData.shifts[2].oeePercentage,
          status: generatedData.shifts[2].status,
        },
      },
      activeAlarms: generatedData.alarms.map((alarm, idx) => ({
        id: `alarm-${plantId}-${idx + 1}`,
        severity: alarm.type.toLowerCase(),
        message: alarm.title,
        location: alarm.location,
        timestamp: new Date(),
      })),
      productionLines: machines
        .filter((m) => m.machineType === "production")
        .map((m) => {
          const status = generateMachineStatus(
            plantId as GeneratorPlantId,
            m.machineId,
            m.machineName
          );
          return {
            machineId: m.machineId,
            machineName: m.machineName,
            status: status.status.toLowerCase(),
            oee: status.oeePercentage,
            currentProduction: status.outputKg,
            targetProduction: Math.round(status.outputKg * 1.15),
            warning: status.warning,
          };
        }),
      packingLines: machines
        .filter((m) => m.machineType === "packing")
        .map((m) => {
          const status = generateMachineStatus(
            plantId as GeneratorPlantId,
            m.machineId,
            m.machineName
          );
          return {
            machineId: m.machineId,
            machineName: m.machineName,
            status: status.status.toLowerCase(),
            efficiency: status.oeePercentage,
            currentPacks: status.outputKg,
            targetPacks: Math.round(status.outputKg * 1.15),
            warning: status.warning,
          };
        }),
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

/**
 * GET /api/plants/:plantId/machines
 * Get all machines for a plant with status
 */
router.get("/:plantId/machines", validatePlantId, async (req, res) => {
  try {
    const { plantId } = req.params as { plantId: PlantId };
    const machines = await plantService.getMachinesByPlant(plantId);

    const machinesWithStatus = machines.map((m) => {
      const status = generateMachineStatus(
        plantId as GeneratorPlantId,
        m.machineId,
        m.machineName
      );
      return {
        ...m,
        liveStatus: status,
      };
    });

    res.json({
      success: true,
      data: machinesWithStatus,
    });
  } catch (error: any) {
    console.error("[PLANT] Error fetching machines:", error);
    res.status(500).json({
      success: false,
      message: error?.message || "Failed to fetch machines",
    });
  }
});

export default router;
