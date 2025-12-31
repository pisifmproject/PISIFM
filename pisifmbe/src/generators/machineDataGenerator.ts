// src/generators/machineDataGenerator.ts
// Centralized machine data generator with isolated state per machine

import type {
  PlantId,
  MachineIdentifier,
  ProcessDataVariables,
  UtilityDataVariables,
  PerformanceDataVariables,
} from './types';

import {
  seededRandom,
  randomValue,
  randomValueConstrained,
  PROCESS_VARIABLE_CONFIG,
  UTILITY_VARIABLE_CONFIG,
  PERFORMANCE_VARIABLE_CONFIG,
} from './config';

// ============================================================================
// ISOLATED MACHINE STATE STORAGE
// Each machine has completely independent state - no shared references
// ============================================================================

interface MachineState {
  processConfig: ReturnType<typeof generateProcessConfig>;
  utilityConfig: ReturnType<typeof generateUtilityConfig>;
  performanceConfig: ReturnType<typeof generatePerformanceConfig>;
  lastUpdate: number;
}

// Map to store isolated state per machine (key: plantId-machineId)
const machineStateMap = new Map<string, MachineState>();

/**
 * Get unique key for machine state storage
 */
function getMachineKey(plantId: string, machineId: string): string {
  return `${plantId}-${machineId}`;
}

/**
 * Get or create isolated machine state
 * Each machine gets its own independent configuration
 */
function getMachineState(plantId: string, machineId: string): MachineState {
  const key = getMachineKey(plantId, machineId);
  
  if (!machineStateMap.has(key)) {
    // Create new isolated state for this machine
    const seed = key;
    machineStateMap.set(key, {
      processConfig: generateProcessConfig(seed),
      utilityConfig: generateUtilityConfig(seed),
      performanceConfig: generatePerformanceConfig(seed),
      lastUpdate: Date.now(),
    });
  }
  
  return machineStateMap.get(key)!;
}

// ============================================================================
// CONFIGURATION GENERATORS
// Generate unique base configuration per machine using seeded random
// ============================================================================

function generateProcessConfig(seed: string) {
  const cfg = PROCESS_VARIABLE_CONFIG;
  
  return {
    // Product Information
    productName: seededRandom(seed + 'prodName', 1, 10) > 5 ? 'WAVY' : 'REGULAR',
    operatingMode: seededRandom(seed + 'opMode', 1, 10) > 1 ? 'NORMAL MODE' : 'MAINTENANCE MODE',
    systemStatusBase: seededRandom(seed + 'sysStatus', cfg.systemStatus.baseValue - 0.3, cfg.systemStatus.baseValue + 0.3),
    plcCommsStatus: seededRandom(seed + 'plcComms', 1, 10) > 0.5 ? 'OK' : 'WARNING',
    
    // Prep / Slicing Systems
    feedFromCratesStatus: seededRandom(seed + 'feedCrates', 1, 10) > 2 ? 'ON' : 'OFF',
    peelerOperationalStatus: seededRandom(seed + 'peelerStat', 1, 10) > 1 ? 'ACTIVE' : 'STANDBY',
    potatoPrepControlMode: seededRandom(seed + 'potatoPrep', 1, 10) > 1 ? 'AUTO' : 'MANUAL',
    slicersControlMode: seededRandom(seed + 'slicersCtrl', 1, 10) > 1 ? 'AUTO' : 'MANUAL',
    washerDrivesControlMode: seededRandom(seed + 'washerCtrl', 1, 10) > 1 ? 'AUTO' : 'MANUAL',
    potatoFeedOperationalStatus: seededRandom(seed + 'potatoFeed', 1, 10) > 2 ? 'ON' : 'OFF',
    slicersInclineBase: seededRandom(seed + 'slicersIncl', cfg.slicersInclinePercentage.baseValue - 2, cfg.slicersInclinePercentage.baseValue + 2),
    headTemperatureBase: seededRandom(seed + 'headTemp', cfg.headTemperature.baseValue - 3, cfg.headTemperature.baseValue + 3),
    peelerRotationalSpeedBase: seededRandom(seed + 'peelerRpm', cfg.peelerRotationalSpeed.baseValue - 30, cfg.peelerRotationalSpeed.baseValue + 30),
    peelerLoadBase: seededRandom(seed + 'peelerLoad', cfg.peelerLoadPercentage.baseValue - 8, cfg.peelerLoadPercentage.baseValue + 8),
    washerLevelBase: seededRandom(seed + 'washerLvl', cfg.washerLevelPercentage.baseValue - 5, cfg.washerLevelPercentage.baseValue + 5),
    washerFlowBase: seededRandom(seed + 'washerFlow', cfg.washerFlowRate.baseValue - 2, cfg.washerFlowRate.baseValue + 2),
    
    // Oil Flow Control
    mainOilCirculationBase: seededRandom(seed + 'oilCirc', cfg.mainOilCirculationRate.baseValue - 0.4, cfg.mainOilCirculationRate.baseValue + 0.4),
    oilCirculationControlBase: seededRandom(seed + 'oilCtrl', cfg.oilCirculationControlValue.baseValue - 5, cfg.oilCirculationControlValue.baseValue + 5),
    
    // Fryer Temperature Control
    fryerInletBase: seededRandom(seed + 'fryerIn', cfg.fryerInletTemperature.baseValue - 3, cfg.fryerInletTemperature.baseValue + 3),
    fryerOutletBase: seededRandom(seed + 'fryerOut', cfg.fryerOutletTemperature.baseValue - 4, cfg.fryerOutletTemperature.baseValue + 4),
    burnerOutputBase: seededRandom(seed + 'burner', cfg.burnerOutputPercentage.baseValue - 8, cfg.burnerOutputPercentage.baseValue + 8),
    
    // Oil Make-up
    usedOilBase: seededRandom(seed + 'usedOil', cfg.usedOilPercentage.baseValue - 3, cfg.usedOilPercentage.baseValue + 3),
    newOilBase: seededRandom(seed + 'newOil', cfg.newOilPercentage.baseValue - 3, cfg.newOilPercentage.baseValue + 3),
    oilLevelBase: seededRandom(seed + 'oilLvl', cfg.oilLevelMillimeters.baseValue - 15, cfg.oilLevelMillimeters.baseValue + 15),
    oilQualityStatus: seededRandom(seed + 'oilQual', 1, 10) > 2 ? 'FRESH' : 'USED',
    valveOutputBase: seededRandom(seed + 'valve', cfg.valveOutputPercentage.baseValue - 10, cfg.valveOutputPercentage.baseValue + 10),
    
    // Moisture Control
    actualMoistureBase: seededRandom(seed + 'moisture', cfg.actualMoistureContent.baseValue - 0.2, cfg.actualMoistureContent.baseValue + 0.2),
    actualOilContentBase: seededRandom(seed + 'oilContent', cfg.actualOilContent.baseValue - 3, cfg.actualOilContent.baseValue + 3),
    
    // Drives
    masterSpeedBase: seededRandom(seed + 'masterSpd', cfg.masterSpeedPercentage.baseValue - 8, cfg.masterSpeedPercentage.baseValue + 8),
    masterSpeedLinearBase: seededRandom(seed + 'masterLin', cfg.masterSpeedLinearValue.baseValue - 6, cfg.masterSpeedLinearValue.baseValue + 6),
    paddleSpeedBase: seededRandom(seed + 'paddle', cfg.paddleSpeedPercentage.baseValue - 5, cfg.paddleSpeedPercentage.baseValue + 5),
    submergerSpeedBase: seededRandom(seed + 'submerger', cfg.submergerSpeedPercentage.baseValue - 5, cfg.submergerSpeedPercentage.baseValue + 5),
    takeoutSpeedBase: seededRandom(seed + 'takeout', cfg.takeoutSpeedPercentage.baseValue - 5, cfg.takeoutSpeedPercentage.baseValue + 5),
    fryerOutfeedControlMode: seededRandom(seed + 'outfeed', 1, 10) > 1 ? 'AUTO' : 'MANUAL',
    takeoutConveyorStatus: seededRandom(seed + 'takeoutConv', 1, 10) > 1 ? 'ON' : 'OFF',
    postFryerControlMode: seededRandom(seed + 'postFryer', 1, 10) > 1 ? 'AUTO' : 'MANUAL',
    
    // Quality Specifications
    sliceThicknessBase: seededRandom(seed + 'sliceThick', cfg.sliceThickness.baseValue - 0.1, cfg.sliceThickness.baseValue + 0.1),
    potatoSolidsBase: seededRandom(seed + 'potatoSolids', cfg.potatoSolidsPercentage.baseValue - 2, cfg.potatoSolidsPercentage.baseValue + 2),
  };
}

function generateUtilityConfig(seed: string) {
  const cfg = UTILITY_VARIABLE_CONFIG;
  
  return {
    electricalPowerBase: seededRandom(seed + 'elecPower', cfg.electricalPower.baseValue - 1000, cfg.electricalPower.baseValue + 1000),
    steamConsumptionBase: seededRandom(seed + 'steam', cfg.steamConsumption.baseValue - 20, cfg.steamConsumption.baseValue + 20),
    waterConsumptionBase: seededRandom(seed + 'water', cfg.waterConsumption.baseValue - 2, cfg.waterConsumption.baseValue + 2),
    compressedAirBase: seededRandom(seed + 'compAir', cfg.compressedAirConsumption.baseValue - 2000, cfg.compressedAirConsumption.baseValue + 2000),
    naturalGasBase: seededRandom(seed + 'natGas', cfg.naturalGasConsumption.baseValue - 12, cfg.naturalGasConsumption.baseValue + 12),
  };
}

function generatePerformanceConfig(seed: string) {
  const cfg = PERFORMANCE_VARIABLE_CONFIG;
  
  return {
    oeeBase: seededRandom(seed + 'oee', cfg.oeePercentage.baseValue - 10, cfg.oeePercentage.baseValue + 10),
    availabilityBase: seededRandom(seed + 'avail', cfg.availabilityPercentage.baseValue - 8, cfg.availabilityPercentage.baseValue + 8),
    performanceBase: seededRandom(seed + 'perf', cfg.performancePercentage.baseValue - 8, cfg.performancePercentage.baseValue + 8),
    qualityBase: seededRandom(seed + 'qual', cfg.qualityPercentage.baseValue - 3, cfg.qualityPercentage.baseValue + 3),
    productionRateBase: seededRandom(seed + 'prodRate', cfg.productionRateKgPerHour.baseValue - 100, cfg.productionRateKgPerHour.baseValue + 100),
    rejectRateBase: seededRandom(seed + 'reject', cfg.rejectRate.baseValue - 1, cfg.rejectRate.baseValue + 1),
    downtimeBase: seededRandom(seed + 'downtime', cfg.downtimeMinutes.baseValue - 10, cfg.downtimeMinutes.baseValue + 10),
    cycleTimeBase: seededRandom(seed + 'cycle', cfg.cycleTime.baseValue - 5, cfg.cycleTime.baseValue + 5),
    mainMotorCurrentBase: seededRandom(seed + 'mainCurr', cfg.mainMotorCurrent.baseValue - 15, cfg.mainMotorCurrent.baseValue + 15),
    mainMotorVoltageBase: seededRandom(seed + 'mainVolt', cfg.mainMotorVoltage.baseValue - 5, cfg.mainMotorVoltage.baseValue + 5),
    mainMotorFrequencyBase: seededRandom(seed + 'mainFreq', cfg.mainMotorFrequency.baseValue - 0.5, cfg.mainMotorFrequency.baseValue + 0.5),
    auxiliaryMotorCurrentBase: seededRandom(seed + 'auxCurr', cfg.auxiliaryMotorCurrent.baseValue - 8, cfg.auxiliaryMotorCurrent.baseValue + 8),
    vibrationBase: seededRandom(seed + 'vib', cfg.vibrationLevel.baseValue - 1, cfg.vibrationLevel.baseValue + 1),
    bearingTempBase: seededRandom(seed + 'bearing', cfg.bearingTemperature.baseValue - 8, cfg.bearingTemperature.baseValue + 8),
    lubricationPressureBase: seededRandom(seed + 'lube', cfg.lubricationPressure.baseValue - 0.5, cfg.lubricationPressure.baseValue + 0.5),
    filterPressureDropBase: seededRandom(seed + 'filter', cfg.filterPressureDrop.baseValue - 0.3, cfg.filterPressureDrop.baseValue + 0.3),
  };
}

// ============================================================================
// DATA GENERATORS
// Generate live data with variance from isolated machine configuration
// ============================================================================

/**
 * Generate process data for a specific machine
 * Each call returns fresh data with variance from the machine's base configuration
 */
export function generateProcessData(plantId: string, machineId: string): ProcessDataVariables {
  const state = getMachineState(plantId, machineId);
  const cfg = state.processConfig;
  const varCfg = PROCESS_VARIABLE_CONFIG;
  
  const fryerInlet = parseFloat(randomValue(cfg.fryerInletBase, varCfg.fryerInletTemperature.variance).toFixed(1));
  const fryerOutlet = parseFloat(randomValue(cfg.fryerOutletBase, varCfg.fryerOutletTemperature.variance).toFixed(1));
  
  return {
    // Product Information
    productName: cfg.productName,
    operatingMode: cfg.operatingMode,
    systemStatus: parseFloat(randomValue(cfg.systemStatusBase, varCfg.systemStatus.variance).toFixed(2)),
    plcCommsStatus: cfg.plcCommsStatus,
    
    // Prep / Slicing Systems
    feedFromCratesStatus: cfg.feedFromCratesStatus,
    peelerOperationalStatus: cfg.peelerOperationalStatus,
    potatoPrepControlMode: cfg.potatoPrepControlMode,
    slicersControlMode: cfg.slicersControlMode,
    washerDrivesControlMode: cfg.washerDrivesControlMode,
    potatoFeedOperationalStatus: cfg.potatoFeedOperationalStatus,
    slicersInclinePercentage: parseFloat(randomValue(cfg.slicersInclineBase, varCfg.slicersInclinePercentage.variance).toFixed(1)),
    headTemperature: Math.round(randomValue(cfg.headTemperatureBase, varCfg.headTemperature.variance)),
    peelerRotationalSpeed: Math.round(randomValue(cfg.peelerRotationalSpeedBase, varCfg.peelerRotationalSpeed.variance)),
    peelerLoadPercentage: Math.round(randomValue(cfg.peelerLoadBase, varCfg.peelerLoadPercentage.variance)),
    washerLevelPercentage: Math.round(randomValue(cfg.washerLevelBase, varCfg.washerLevelPercentage.variance)),
    washerFlowRate: parseFloat(randomValue(cfg.washerFlowBase, varCfg.washerFlowRate.variance).toFixed(1)),
    
    // Oil Flow Control
    mainOilCirculationRate: parseFloat(randomValue(cfg.mainOilCirculationBase, varCfg.mainOilCirculationRate.variance).toFixed(3)),
    oilCirculationControlValue: Math.round(randomValue(cfg.oilCirculationControlBase, varCfg.oilCirculationControlValue.variance)),
    
    // Fryer Temperature Control
    fryerInletTemperature: fryerInlet,
    fryerInletSetpoint: varCfg.fryerInletSetpoint.baseValue,
    fryerOutletTemperature: fryerOutlet,
    temperatureDelta: parseFloat((fryerInlet - fryerOutlet).toFixed(1)),
    burnerOutputPercentage: parseFloat(randomValue(cfg.burnerOutputBase, varCfg.burnerOutputPercentage.variance).toFixed(1)),
    
    // Oil Make-up
    usedOilPercentage: Math.max(0, Math.round(randomValue(cfg.usedOilBase, varCfg.usedOilPercentage.variance))),
    newOilPercentage: Math.min(100, Math.round(randomValue(cfg.newOilBase, varCfg.newOilPercentage.variance))),
    oilLevelMillimeters: Math.round(randomValue(cfg.oilLevelBase, varCfg.oilLevelMillimeters.variance)),
    oilQualityStatus: cfg.oilQualityStatus,
    valveOutputPercentage: parseFloat(randomValue(cfg.valveOutputBase, varCfg.valveOutputPercentage.variance).toFixed(1)),
    
    // Moisture Control
    actualMoistureContent: parseFloat(randomValue(cfg.actualMoistureBase, varCfg.actualMoistureContent.variance).toFixed(2)),
    moistureSetpoint: varCfg.moistureSetpoint.baseValue,
    actualOilContent: parseFloat(randomValue(cfg.actualOilContentBase, varCfg.actualOilContent.variance).toFixed(1)),
    oilContentSetpoint: varCfg.oilContentSetpoint.baseValue,
    
    // Other Systems / Drives
    masterSpeedPercentage: parseFloat(randomValue(cfg.masterSpeedBase, varCfg.masterSpeedPercentage.variance).toFixed(1)),
    masterSpeedLinearValue: Math.round(randomValue(cfg.masterSpeedLinearBase, varCfg.masterSpeedLinearValue.variance)),
    paddleSpeedPercentage: Math.round(randomValue(cfg.paddleSpeedBase, varCfg.paddleSpeedPercentage.variance)),
    submergerSpeedPercentage: Math.round(randomValue(cfg.submergerSpeedBase, varCfg.submergerSpeedPercentage.variance)),
    takeoutSpeedPercentage: Math.round(randomValue(cfg.takeoutSpeedBase, varCfg.takeoutSpeedPercentage.variance)),
    fryerOutfeedControlMode: cfg.fryerOutfeedControlMode,
    takeoutConveyorStatus: cfg.takeoutConveyorStatus,
    postFryerControlMode: cfg.postFryerControlMode,
    
    // Quality Specifications
    sliceThickness: parseFloat(randomValue(cfg.sliceThicknessBase, varCfg.sliceThickness.variance).toFixed(3)),
    potatoSolidsPercentage: parseFloat(randomValue(cfg.potatoSolidsBase, varCfg.potatoSolidsPercentage.variance).toFixed(1)),
    
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate utility data for a specific machine
 */
export function generateUtilityData(plantId: string, machineId: string): UtilityDataVariables {
  const state = getMachineState(plantId, machineId);
  const cfg = state.utilityConfig;
  const varCfg = UTILITY_VARIABLE_CONFIG;
  
  const electricalPower = Math.round(randomValue(cfg.electricalPowerBase, varCfg.electricalPower.variance));
  const steamConsumption = parseFloat(randomValue(cfg.steamConsumptionBase, varCfg.steamConsumption.variance).toFixed(1));
  const waterConsumption = parseFloat(randomValue(cfg.waterConsumptionBase, varCfg.waterConsumption.variance).toFixed(1));
  const compressedAir = Math.round(randomValue(cfg.compressedAirBase, varCfg.compressedAirConsumption.variance));
  const naturalGas = parseFloat(randomValue(cfg.naturalGasBase, varCfg.naturalGasConsumption.variance).toFixed(1));
  
  return {
    // Electrical Power
    electricalPower,
    electricalPowerUnit: 'kW',
    electricalPowerCost: Math.round(electricalPower * varCfg.electricalPowerCostRate),
    electricalPowerCostUnit: 'IDR/hr',
    
    // Steam Consumption
    steamConsumption,
    steamConsumptionUnit: 'kg/hr',
    steamConsumptionCost: Math.round(steamConsumption * varCfg.steamCostRate),
    steamConsumptionCostUnit: 'IDR/hr',
    
    // Water Consumption
    waterConsumption,
    waterConsumptionUnit: 'm³/hr',
    waterConsumptionCost: Math.round(waterConsumption * varCfg.waterCostRate),
    waterConsumptionCostUnit: 'IDR/hr',
    
    // Compressed Air
    compressedAirConsumption: compressedAir,
    compressedAirConsumptionUnit: 'L/min',
    compressedAirConsumptionCost: Math.round(compressedAir * varCfg.compressedAirCostRate),
    compressedAirConsumptionCostUnit: 'IDR/hr',
    
    // Natural Gas
    naturalGasConsumption: naturalGas,
    naturalGasConsumptionUnit: 'm³/hr',
    naturalGasConsumptionCost: Math.round(naturalGas * varCfg.naturalGasCostRate),
    naturalGasConsumptionCostUnit: 'IDR/hr',
    
    timestamp: new Date().toISOString(),
  };
}

/**
 * Generate performance data for a specific machine
 */
export function generatePerformanceData(plantId: string, machineId: string): PerformanceDataVariables {
  const state = getMachineState(plantId, machineId);
  const cfg = state.performanceConfig;
  const varCfg = PERFORMANCE_VARIABLE_CONFIG;
  
  const productionRate = Math.round(randomValue(cfg.productionRateBase, varCfg.productionRateKgPerHour.variance));
  const actualProduction = productionRate * 8; // 8 hour shift
  const targetProduction = Math.round(cfg.productionRateBase * 8 * 1.15); // 15% above base
  
  return {
    // OEE Metrics
    oeePercentage: parseFloat(Math.max(0, Math.min(100, randomValue(cfg.oeeBase, varCfg.oeePercentage.variance))).toFixed(1)),
    oeePercentageUnit: '%',
    availabilityPercentage: parseFloat(Math.max(0, Math.min(100, randomValue(cfg.availabilityBase, varCfg.availabilityPercentage.variance))).toFixed(1)),
    availabilityPercentageUnit: '%',
    performancePercentage: parseFloat(Math.max(0, Math.min(100, randomValue(cfg.performanceBase, varCfg.performancePercentage.variance))).toFixed(1)),
    performancePercentageUnit: '%',
    qualityPercentage: parseFloat(Math.max(0, Math.min(100, randomValue(cfg.qualityBase, varCfg.qualityPercentage.variance))).toFixed(1)),
    qualityPercentageUnit: '%',
    
    // Production Metrics
    actualProduction,
    actualProductionUnit: 'kg',
    targetProduction,
    targetProductionUnit: 'kg',
    runRate: productionRate,
    runRateUnit: 'kg/hr',
    rejectRate: parseFloat(Math.max(0, randomValue(cfg.rejectRateBase, varCfg.rejectRate.variance)).toFixed(2)),
    rejectRateUnit: '%',
    
    // Downtime & Cycle
    downtimeMinutes: Math.max(0, Math.round(randomValue(cfg.downtimeBase, varCfg.downtimeMinutes.variance))),
    downtimeMinutesUnit: 'min',
    cycleTime: Math.max(5, Math.round(randomValue(cfg.cycleTimeBase, varCfg.cycleTime.variance))),
    cycleTimeUnit: 'sec',
    
    // Motor Variables
    mainMotorCurrent: parseFloat(randomValue(cfg.mainMotorCurrentBase, varCfg.mainMotorCurrent.variance).toFixed(1)),
    mainMotorCurrentUnit: 'A',
    mainMotorVoltage: Math.round(randomValue(cfg.mainMotorVoltageBase, varCfg.mainMotorVoltage.variance)),
    mainMotorVoltageUnit: 'V',
    mainMotorFrequency: parseFloat(randomValue(cfg.mainMotorFrequencyBase, varCfg.mainMotorFrequency.variance).toFixed(1)),
    mainMotorFrequencyUnit: 'Hz',
    auxiliaryMotorCurrent: parseFloat(randomValue(cfg.auxiliaryMotorCurrentBase, varCfg.auxiliaryMotorCurrent.variance).toFixed(1)),
    auxiliaryMotorCurrentUnit: 'A',
    
    // Vibration & Maintenance
    vibrationLevel: parseFloat(randomValue(cfg.vibrationBase, varCfg.vibrationLevel.variance).toFixed(1)),
    vibrationLevelUnit: 'mm/s',
    bearingTemperature: Math.round(randomValue(cfg.bearingTempBase, varCfg.bearingTemperature.variance)),
    bearingTemperatureUnit: '°C',
    lubricationPressure: parseFloat(randomValue(cfg.lubricationPressureBase, varCfg.lubricationPressure.variance).toFixed(1)),
    lubricationPressureUnit: 'bar',
    filterPressureDrop: parseFloat(randomValue(cfg.filterPressureDropBase, varCfg.filterPressureDrop.variance).toFixed(1)),
    filterPressureDropUnit: 'bar',
    
    timestamp: new Date().toISOString(),
  };
}

/**
 * Clear machine state (useful for testing or reset)
 */
export function clearMachineState(plantId?: string, machineId?: string): void {
  if (plantId && machineId) {
    machineStateMap.delete(getMachineKey(plantId, machineId));
  } else {
    machineStateMap.clear();
  }
}

/**
 * Get all active machine keys (for debugging)
 */
export function getActiveMachineKeys(): string[] {
  return Array.from(machineStateMap.keys());
}
