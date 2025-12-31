// src/utility/utility.services.ts
// Utility services using centralized dummy data generator

import {
  generateUtilityConsumption,
  generateUtilityTrend,
  generateUtilitySummary,
  generateUtilityDetailData,
  PlantId,
} from "../generators";

export type UtilityType =
  | "electricity"
  | "steam"
  | "water"
  | "compressedAir"
  | "nitrogen"
  | "gas";

export type TimePeriod = "daily" | "monthly";
export type TrendRange = "7days" | "30days" | "12months";

// Map frontend utility types to generator types
const UTILITY_TYPE_MAP: Record<string, keyof typeof GENERATOR_UTILITY_TYPES> = {
  electricity: "steam", // Electricity uses real LVMDP data for Cikupa
  freshWater: "water",
  wasteWater: "water",
  water: "water",
  naturalGas: "gas",
  gas: "gas",
  fuelOil: "gas",
  steam: "steam",
  air: "compressedAir",
  compressedAir: "compressedAir",
  nitrogen: "nitrogen",
};

const GENERATOR_UTILITY_TYPES = {
  steam: "steam",
  water: "water",
  compressedAir: "compressedAir",
  nitrogen: "nitrogen",
  gas: "gas",
} as const;

/**
 * Extract plantId from machineId (format: plantId-machineId or just machineId)
 */
function extractPlantId(machineId: string): PlantId {
  // If machineId contains plant prefix, extract it
  const parts = machineId.split("-");
  if (parts.length > 1 && ["cikupa", "semarang", "cikokol", "agro"].includes(parts[0])) {
    return parts[0] as PlantId;
  }
  // Default to cikupa for backward compatibility
  return "cikupa";
}

/**
 * Get utility consumption data for a specific machine and type
 * Uses centralized dummy data generator
 */
export async function getUtilityConsumption(
  machineId: string,
  utilityType: string,
  period: string = "daily",
  date?: string
): Promise<{
  daily: { current: number; target: number; yesterday: number };
  monthly: { current: number; target: number; lastMonth: number };
  unit: string;
}> {
  const plantId = extractPlantId(machineId);
  const mappedType = UTILITY_TYPE_MAP[utilityType] || "steam";
  
  // Use centralized generator
  const data = generateUtilityConsumption(plantId, mappedType as any);
  
  return data;
}

/**
 * Get historical trend data for charts
 * Uses centralized dummy data generator
 */
export async function getUtilityTrend(
  machineId: string,
  utilityType: string,
  range: string = "7days"
): Promise<Array<{ date: string; value: number; target?: number }>> {
  const plantId = extractPlantId(machineId);
  const mappedType = UTILITY_TYPE_MAP[utilityType] || "steam";
  const mappedRange = (range === "7days" || range === "30days" || range === "12months") 
    ? range 
    : "7days";
  
  // Use centralized generator
  const trendData = generateUtilityTrend(plantId, mappedType as any, mappedRange);
  
  // Convert to expected format
  return trendData.labels.map((label, idx) => ({
    date: label,
    value: trendData.data[idx],
    target: Math.round(trendData.data[idx] * 1.1),
  }));
}

/**
 * Get summary of all utility types for a machine
 * Uses centralized dummy data generator
 */
export async function getUtilitySummary(
  machineId: string,
  date?: string
): Promise<Record<string, { current: number; target: number; unit: string }>> {
  const plantId = extractPlantId(machineId);
  
  // Use centralized generator
  const summary = generateUtilitySummary(plantId);
  
  // Convert to expected format
  return {
    steam: {
      current: summary.steam.current,
      target: summary.steam.target,
      unit: summary.steam.unit,
    },
    water: {
      current: summary.water.current,
      target: summary.water.target,
      unit: summary.water.unit,
    },
    compressedAir: {
      current: summary.compressedAir.current,
      target: summary.compressedAir.target,
      unit: summary.compressedAir.unit,
    },
    nitrogen: {
      current: summary.nitrogen.current,
      target: summary.nitrogen.target,
      unit: summary.nitrogen.unit,
    },
    gas: {
      current: summary.gas.current,
      target: summary.gas.target,
      unit: summary.gas.unit,
    },
  };
}

/**
 * Record utility consumption data
 * TODO: Implement database insert when ready
 */
export async function recordUtilityConsumption(data: {
  machineId: string;
  utilityType: UtilityType;
  value: number;
  timestamp?: Date;
}): Promise<{ success: boolean; message: string }> {
  // TODO: Insert into database when ready
  return {
    success: true,
    message: "Utility consumption recorded successfully",
  };
}

/**
 * Get detailed utility data for specific utility page
 */
export async function getUtilityDetail(
  plantId: PlantId,
  utilityType: UtilityType
) {
  const mappedType = UTILITY_TYPE_MAP[utilityType] || "steam";
  return generateUtilityDetailData(plantId, mappedType as any);
}
