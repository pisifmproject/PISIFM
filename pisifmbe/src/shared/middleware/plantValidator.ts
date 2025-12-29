// src/shared/middleware/plantValidator.ts
// Middleware to validate plantId parameter in routes

import { Request, Response, NextFunction } from "express";
import { isValidPlantId } from "../types/plant.types";

/**
 * Middleware to validate plantId from route params
 * Usage: router.get('/plants/:plantId/dashboard', validatePlantId, handler)
 */
export function validatePlantId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { plantId } = req.params;

  if (!plantId) {
    return res.status(400).json({
      success: false,
      message: "plantId parameter is required",
    });
  }

  if (!isValidPlantId(plantId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid plantId. Must be one of: semarang, cikokol, cikupa, agro`,
      providedPlantId: plantId,
    });
  }

  // plantId is valid, continue
  next();
}

/**
 * Middleware to validate machineId from route params
 * Format: {plantId}-{machine-name-slug}
 */
export function validateMachineId(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const { machineId } = req.params;

  if (!machineId) {
    return res.status(400).json({
      success: false,
      message: "machineId parameter is required",
    });
  }

  // Basic format validation: should contain at least one hyphen
  if (!machineId.includes("-")) {
    return res.status(400).json({
      success: false,
      message: "Invalid machineId format. Expected: {plantId}-{machine-slug}",
      providedMachineId: machineId,
    });
  }

  const plantId = machineId.split("-")[0];
  if (!isValidPlantId(plantId)) {
    return res.status(400).json({
      success: false,
      message: `Invalid plantId in machineId. Must start with one of: semarang, cikokol, cikupa, agro`,
      providedMachineId: machineId,
    });
  }

  next();
}
