// src/generators/plantDataGenerator.ts
// Centralized plant dashboard data generator

import type {
  PlantId,
  PlantDashboardVariables,
  MachineStatusVariables,
} from './types';

import {
  seededRandom,
  randomValue,
  PLANT_CONFIG,
  PLANT_DASHBOARD_CONFIG,
  MACHINE_STATUS_CONFIG,
} from './config';

// ============================================================================
// ISOLATED PLANT STATE STORAGE
// ============================================================================

interface PlantState {
  baseConfig: ReturnType<typeof generatePlantBaseConfig>;
  lastUpdate: number;
}

const plantStateMap = new Map<PlantId, PlantState>();

function getPlantState(plantId: PlantId): PlantState {
  if (!plantStateMap.has(plantId)) {
    plantStateMap.set(plantId, {
      baseConfig: generatePlantBaseConfig(plantId),
      lastUpdate: Date.now(),
    });
  }
  return plantStateMap.get(plantId)!;
}

function generatePlantBaseConfig(plantId: PlantId) {
  const seed = plantId;
  const plantCfg = PLANT_CONFIG[plantId];
  const capacityFactor = plantCfg.installedCapacityKva / 5540; // Normalize to Cikupa
  
  return {
    capacityFactor,
    utilizationBase: seededRandom(seed + 'util', 55, 80),
    alarmCountBase: seededRandom(seed + 'alarms', 0, 5),
    
    // Utility base values scaled by capacity
    electricityBase: seededRandom(seed + 'elec', 2500, 3500) * capacityFactor,
    steamBase: seededRandom(seed + 'steam', 1200, 1800) * capacityFactor,
    waterBase: seededRandom(seed + 'water', 80, 120) * capacityFactor,
    compressedAirBase: seededRandom(seed + 'compAir', 150, 220) * capacityFactor,
    nitrogenBase: seededRandom(seed + 'nitrogen', 20, 35) * capacityFactor,
    gasBase: seededRandom(seed + 'gas', 40, 65) * capacityFactor,
    
    // Shift performance bases
    shift1OutputBase: seededRandom(seed + 'shift1Out', 8000, 12000),
    shift1OeeBase: seededRandom(seed + 'shift1Oee', 80, 92),
    shift2OutputBase: seededRandom(seed + 'shift2Out', 7000, 11000),
    shift2OeeBase: seededRandom(seed + 'shift2Oee', 78, 90),
    shift3OutputBase: seededRandom(seed + 'shift3Out', 5000, 9000),
    shift3OeeBase: seededRandom(seed + 'shift3Oee', 75, 88),
  };
}

// ============================================================================
// PLANT DASHBOARD DATA GENERATOR
// ============================================================================

/**
 * Generate plant dashboard data
 * Note: For Cikupa, electricity data should come from real LVMDP - this is handled at route level
 */
export function generatePlantDashboardData(
  plantId: PlantId,
  totalMachines: number,
  activeMachines: number
): PlantDashboardVariables {
  const state = getPlantState(plantId);
  const cfg = state.baseConfig;
  const dashCfg = PLANT_DASHBOARD_CONFIG;
  
  // Determine current shift based on time
  const now = new Date();
  const hour = now.getHours();
  let currentShift: 1 | 2 | 3;
  if (hour >= 7 && hour < 15) currentShift = 1;
  else if (hour >= 15 && hour < 22) currentShift = 2;
  else currentShift = 3;
  
  // Generate utility values with variance
  const electricityCurrent = Math.round(randomValue(cfg.electricityBase, cfg.electricityBase * 0.15));
  const steamCurrent = Math.round(randomValue(cfg.steamBase, cfg.steamBase * 0.12));
  const waterCurrent = Math.round(randomValue(cfg.waterBase, cfg.waterBase * 0.1));
  const compressedAirCurrent = Math.round(randomValue(cfg.compressedAirBase, cfg.compressedAirBase * 0.12));
  const nitrogenCurrent = Math.round(randomValue(cfg.nitrogenBase, cfg.nitrogenBase * 0.1));
  const gasCurrent = Math.round(randomValue(cfg.gasBase, cfg.gasBase * 0.1));
  
  // Calculate total energy (simplified: electricity * hours)
  const hoursIntoShift = (hour - (currentShift === 1 ? 7 : currentShift === 2 ? 15 : 22) + 24) % 24;
  const totalEnergyToday = Math.round(electricityCurrent * (hoursIntoShift + (currentShift - 1) * 7.5));
  
  // Generate shift data
  const shifts = dashCfg.shifts.map((shift, idx) => {
    const shiftNum = idx + 1;
    let status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
    let outputKg: number;
    let oeePercentage: number;
    
    if (shiftNum < currentShift) {
      status = 'COMPLETED';
      outputKg = Math.round(randomValue(
        shiftNum === 1 ? cfg.shift1OutputBase : cfg.shift2OutputBase,
        500
      ));
      oeePercentage = parseFloat(randomValue(
        shiftNum === 1 ? cfg.shift1OeeBase : cfg.shift2OeeBase,
        3
      ).toFixed(1));
    } else if (shiftNum === currentShift) {
      status = 'ACTIVE';
      const progressFactor = hoursIntoShift / 7.5;
      const baseOutput = shiftNum === 1 ? cfg.shift1OutputBase : shiftNum === 2 ? cfg.shift2OutputBase : cfg.shift3OutputBase;
      outputKg = Math.round(baseOutput * progressFactor);
      oeePercentage = parseFloat(randomValue(
        shiftNum === 1 ? cfg.shift1OeeBase : shiftNum === 2 ? cfg.shift2OeeBase : cfg.shift3OeeBase,
        3
      ).toFixed(1));
    } else {
      status = 'UPCOMING';
      outputKg = 0;
      oeePercentage = 0;
    }
    
    return {
      shiftNumber: shiftNum,
      shiftName: shift.name,
      timeRange: shift.timeRange,
      outputKg,
      oeePercentage,
      status,
    };
  });
  
  // Generate alarms (random selection from templates)
  const alarmCount = Math.min(3, Math.max(0, Math.round(randomValue(cfg.alarmCountBase, 1.5))));
  const shuffledAlarms = [...dashCfg.alarmTemplates].sort(() => Math.random() - 0.5);
  const alarms = shuffledAlarms.slice(0, alarmCount).map(alarm => ({
    title: alarm.title,
    timestamp: generateRecentTimestamp(),
    location: `${alarm.location} ${PLANT_CONFIG[plantId].displayName.split(' ')[1]}`,
    type: alarm.type,
  }));
  
  return {
    totalEnergyToday,
    utilizationPercent: parseFloat(randomValue(cfg.utilizationBase, 8).toFixed(1)),
    activeAlarms: alarmCount,
    activeMachines,
    totalMachines,
    
    utilities: {
      electricity: {
        current: electricityCurrent,
        target: Math.round(dashCfg.utilityTargets.electricity.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.electricity.unit,
      },
      steam: {
        current: steamCurrent,
        target: Math.round(dashCfg.utilityTargets.steam.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.steam.unit,
      },
      water: {
        current: waterCurrent,
        target: Math.round(dashCfg.utilityTargets.water.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.water.unit,
      },
      compressedAir: {
        current: compressedAirCurrent,
        target: Math.round(dashCfg.utilityTargets.compressedAir.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.compressedAir.unit,
      },
      nitrogen: {
        current: nitrogenCurrent,
        target: Math.round(dashCfg.utilityTargets.nitrogen.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.nitrogen.unit,
      },
      gas: {
        current: gasCurrent,
        target: Math.round(dashCfg.utilityTargets.gas.baseTarget * cfg.capacityFactor),
        unit: dashCfg.utilityTargets.gas.unit,
      },
    },
    
    shifts,
    alarms,
  };
}

// ============================================================================
// MACHINE STATUS GENERATOR
// ============================================================================

/**
 * Generate machine status for plant dashboard machine list
 */
export function generateMachineStatus(
  plantId: PlantId,
  machineId: string,
  machineName: string
): MachineStatusVariables {
  const seed = `${plantId}-${machineId}`;
  const statusCfg = MACHINE_STATUS_CONFIG;
  
  // Determine status based on seeded probability
  const statusRoll = seededRandom(seed + 'status', 0, 1);
  let status: MachineStatusVariables['status'];
  let cumulative = 0;
  
  for (const [s, prob] of Object.entries(statusCfg.statusProbabilities)) {
    cumulative += prob;
    if (statusRoll < cumulative) {
      status = s as MachineStatusVariables['status'];
      break;
    }
  }
  status = status! || 'RUNNING';
  
  // Get output and OEE based on status
  const outputRange = statusCfg.outputRanges[status];
  const oeeRange = statusCfg.oeeRanges[status];
  
  const outputKg = status === 'RUNNING' 
    ? Math.round(randomValue((outputRange.min + outputRange.max) / 2, (outputRange.max - outputRange.min) / 3))
    : outputRange.min;
    
  const oeePercentage = status === 'RUNNING'
    ? parseFloat(randomValue((oeeRange.min + oeeRange.max) / 2, (oeeRange.max - oeeRange.min) / 3).toFixed(1))
    : oeeRange.min;
  
  // Determine warning
  let warning: string | undefined;
  if (status === 'MAINTENANCE' || status === 'STOPPED') {
    const warningIdx = Math.floor(seededRandom(seed + 'warning', 0, statusCfg.warningMessages.length));
    warning = statusCfg.warningMessages[warningIdx];
  }
  
  return {
    machineId,
    machineName,
    status,
    outputKg,
    oeePercentage,
    warning,
  };
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function generateRecentTimestamp(): string {
  const now = new Date();
  const minutesAgo = Math.floor(Math.random() * 120); // Within last 2 hours
  now.setMinutes(now.getMinutes() - minutesAgo);
  return now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

/**
 * Clear plant state (useful for testing)
 */
export function clearPlantState(plantId?: PlantId): void {
  if (plantId) {
    plantStateMap.delete(plantId);
  } else {
    plantStateMap.clear();
  }
}
