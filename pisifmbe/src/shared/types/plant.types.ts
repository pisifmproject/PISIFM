// src/shared/types/plant.types.ts
// Shared types for multi-plant architecture

export const VALID_PLANT_IDS = ["semarang", "cikokol", "cikupa", "agro"] as const;
export type PlantId = (typeof VALID_PLANT_IDS)[number];

export interface PlantMetadata {
  plantId: PlantId;
  displayName: string;
  location: string | null;
  status: string;
  hasRealData: boolean;
  installedCapacityKva: number;
  metadata: any;
}

export interface MachineMetadata {
  machineId: string;
  plantId: PlantId;
  machineName: string;
  machineType: string | null;
  lineCategory: string | null;
  status: string;
  metadata: any;
}

export function isValidPlantId(plantId: string): plantId is PlantId {
  return VALID_PLANT_IDS.includes(plantId as PlantId);
}
