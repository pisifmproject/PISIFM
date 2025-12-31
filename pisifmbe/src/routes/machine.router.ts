// src/routes/machine.router.ts
// Machine data router - Uses centralized dummy data generator
// Each machine has isolated state with unique variables

import { Router } from "express";
import {
  generateProcessData,
  generateUtilityData,
  generatePerformanceData,
} from "../generators";

const r = Router();

// GET /api/machine/:plantId/:machineId/process
// Returns process data for a specific machine with isolated state
r.get("/:plantId/:machineId/process", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const processData = generateProcessData(plantId, machineId);
    return res.json(processData);
  } catch (err) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: String(err) 
    });
  }
});

// GET /api/machine/:plantId/:machineId/utility
// Returns utility consumption data for a specific machine
r.get("/:plantId/:machineId/utility", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const utilityData = generateUtilityData(plantId, machineId);
    return res.json(utilityData);
  } catch (err) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: String(err) 
    });
  }
});

// GET /api/machine/:plantId/:machineId/performance
// Returns performance metrics for a specific machine
r.get("/:plantId/:machineId/performance", async (req, res) => {
  try {
    const { plantId, machineId } = req.params;
    const performanceData = generatePerformanceData(plantId, machineId);
    return res.json(performanceData);
  } catch (err) {
    return res.status(500).json({ 
      message: "Internal server error", 
      error: String(err) 
    });
  }
});

export default r;
