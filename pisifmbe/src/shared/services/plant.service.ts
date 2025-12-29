// src/shared/services/plant.service.ts
// Service layer for plant and machine metadata

import { db } from "../../db";
import { plants, machines } from "../../db/schema";
import { eq } from "drizzle-orm";
import { PlantId, PlantMetadata, MachineMetadata } from "../types/plant.types";

/**
 * Get all plants
 */
export async function getAllPlants(): Promise<PlantMetadata[]> {
  const result = await db.select().from(plants);
  return result.map((p) => ({
    plantId: p.plantId as PlantId,
    displayName: p.displayName,
    location: p.location,
    status: p.status,
    hasRealData: p.hasRealData,
    installedCapacityKva: p.installedCapacityKva || 0,
    metadata: p.metadata,
  }));
}

/**
 * Get single plant by ID
 */
export async function getPlantById(
  plantId: PlantId
): Promise<PlantMetadata | null> {
  const result = await db
    .select()
    .from(plants)
    .where(eq(plants.plantId, plantId))
    .limit(1);

  if (result.length === 0) return null;

  const p = result[0];
  return {
    plantId: p.plantId as PlantId,
    displayName: p.displayName,
    location: p.location,
    status: p.status,
    hasRealData: p.hasRealData,
    installedCapacityKva: p.installedCapacityKva || 0,
    metadata: p.metadata,
  };
}

/**
 * Get all machines for a specific plant
 */
export async function getMachinesByPlant(
  plantId: PlantId
): Promise<MachineMetadata[]> {
  const result = await db
    .select()
    .from(machines)
    .where(eq(machines.plantId, plantId));

  return result.map((m) => ({
    machineId: m.machineId,
    plantId: m.plantId as PlantId,
    machineName: m.machineName,
    machineType: m.machineType,
    lineCategory: m.lineCategory,
    status: m.status,
    metadata: m.metadata,
  }));
}

/**
 * Get single machine by ID
 */
export async function getMachineById(
  machineId: string
): Promise<MachineMetadata | null> {
  const result = await db
    .select()
    .from(machines)
    .where(eq(machines.machineId, machineId))
    .limit(1);

  if (result.length === 0) return null;

  const m = result[0];
  return {
    machineId: m.machineId,
    plantId: m.plantId as PlantId,
    machineName: m.machineName,
    machineType: m.machineType,
    lineCategory: m.lineCategory,
    status: m.status,
    metadata: m.metadata,
  };
}

/**
 * Get all machines across all plants
 */
export async function getAllMachines(): Promise<MachineMetadata[]> {
  const result = await db.select().from(machines);

  return result.map((m) => ({
    machineId: m.machineId,
    plantId: m.plantId as PlantId,
    machineName: m.machineName,
    machineType: m.machineType,
    lineCategory: m.lineCategory,
    status: m.status,
    metadata: m.metadata,
  }));
}
