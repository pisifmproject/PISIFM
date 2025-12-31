// src/generators/config.ts
// Centralized configuration for dummy data generation
// All variance ranges and base values defined here for easy modification

import type { PlantId, VariableConfig } from './types';

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Seeded random number generator for consistent values per machine
 * Uses string hash to generate deterministic pseudo-random numbers
 */
export function seededRandom(seed: string, min: number, max: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash = hash & hash;
  }
  const normalized = Math.abs(Math.sin(hash)) * 10000;
  return min + (normalized % (max - min));
}

/**
 * Generate random value with variance around base value
 */
export function randomValue(base: number, variance: number): number {
  return base + (Math.random() * variance * 2 - variance);
}

/**
 * Generate random value with constraints
 */
export function randomValueConstrained(config: VariableConfig): number {
  let value = randomValue(config.baseValue, config.variance);
  if (config.min !== undefined) value = Math.max(config.min, value);
  if (config.max !== undefined) value = Math.min(config.max, value);
  return config.decimals !== undefined 
    ? parseFloat(value.toFixed(config.decimals)) 
    : value;
}

// ============================================================================
// PLANT CONFIGURATION
// ============================================================================

export const PLANT_CONFIG: Record<PlantId, {
  displayName: string;
  location: string;
  hasRealData: boolean;
  installedCapacityKva: number;
}> = {
  cikupa: {
    displayName: 'Plant Cikupa',
    location: 'Cikupa, Tangerang',
    hasRealData: true, // LVMDP uses real data
    installedCapacityKva: 5540,
  },
  semarang: {
    displayName: 'Plant Semarang',
    location: 'Semarang, Central Java',
    hasRealData: false,
    installedCapacityKva: 4500,
  },
  cikokol: {
    displayName: 'Plant Cikokol',
    location: 'Cikokol, Tangerang',
    hasRealData: false,
    installedCapacityKva: 3800,
  },
  agro: {
    displayName: 'Plant Agro',
    location: 'Agro Industrial Area',
    hasRealData: false,
    installedCapacityKva: 3200,
  },
};

// ============================================================================
// PROCESS VARIABLE CONFIGURATION
// ============================================================================

export const PROCESS_VARIABLE_CONFIG = {
  // System Status
  systemStatus: { baseValue: 2.0, variance: 0.15, min: 1.5, max: 2.5, decimals: 2 },
  
  // Prep / Slicing Systems
  slicersInclinePercentage: { baseValue: 22.5, variance: 1.5, min: 18, max: 28, decimals: 1 },
  headTemperature: { baseValue: 38, variance: 2.0, min: 32, max: 45, decimals: 0 },
  peelerRotationalSpeed: { baseValue: 1450, variance: 50, min: 1350, max: 1550, decimals: 0 },
  peelerLoadPercentage: { baseValue: 72, variance: 5.0, min: 55, max: 90, decimals: 0 },
  washerLevelPercentage: { baseValue: 82, variance: 5.0, min: 65, max: 95, decimals: 0 },
  washerFlowRate: { baseValue: 12.5, variance: 1.5, min: 8, max: 18, decimals: 1 },
  
  // Oil Flow Control
  mainOilCirculationRate: { baseValue: 4.4, variance: 0.3, min: 3.5, max: 5.5, decimals: 3 },
  oilCirculationControlValue: { baseValue: 97, variance: 3, min: 90, max: 100, decimals: 0 },
  
  // Fryer Temperature Control
  fryerInletTemperature: { baseValue: 178, variance: 2.0, min: 170, max: 185, decimals: 1 },
  fryerInletSetpoint: { baseValue: 178, variance: 0, decimals: 1 },
  fryerOutletTemperature: { baseValue: 154, variance: 3.0, min: 145, max: 165, decimals: 1 },
  burnerOutputPercentage: { baseValue: 44, variance: 5.0, min: 25, max: 75, decimals: 1 },
  
  // Oil Make-up
  usedOilPercentage: { baseValue: 5, variance: 5, min: 0, max: 25, decimals: 0 },
  newOilPercentage: { baseValue: 95, variance: 5, min: 75, max: 100, decimals: 0 },
  oilLevelMillimeters: { baseValue: 150, variance: 10, min: 120, max: 180, decimals: 0 },
  valveOutputPercentage: { baseValue: 55, variance: 8, min: 30, max: 80, decimals: 1 },
  
  // Moisture Control
  actualMoistureContent: { baseValue: 1.9, variance: 0.15, min: 1.2, max: 2.5, decimals: 2 },
  moistureSetpoint: { baseValue: 1.35, variance: 0, decimals: 2 },
  actualOilContent: { baseValue: 27, variance: 2.0, min: 22, max: 35, decimals: 1 },
  oilContentSetpoint: { baseValue: 35, variance: 0, decimals: 1 },
  
  // Drives
  masterSpeedPercentage: { baseValue: 70, variance: 5.0, min: 50, max: 95, decimals: 1 },
  masterSpeedLinearValue: { baseValue: 67, variance: 5, min: 50, max: 85, decimals: 0 },
  paddleSpeedPercentage: { baseValue: 42, variance: 4.0, min: 30, max: 60, decimals: 0 },
  submergerSpeedPercentage: { baseValue: 52, variance: 4.0, min: 35, max: 70, decimals: 0 },
  takeoutSpeedPercentage: { baseValue: 46, variance: 4.0, min: 30, max: 65, decimals: 0 },
  
  // Quality Specifications
  sliceThickness: { baseValue: 1.75, variance: 0.05, min: 1.5, max: 2.0, decimals: 3 },
  potatoSolidsPercentage: { baseValue: 20, variance: 1.5, min: 16, max: 24, decimals: 1 },
};

// ============================================================================
// UTILITY VARIABLE CONFIGURATION
// ============================================================================

export const UTILITY_VARIABLE_CONFIG = {
  // Electrical Power
  electricalPower: { baseValue: 5200, variance: 800, min: 3500, max: 7500, decimals: 0 },
  electricalPowerCostRate: 1.2, // IDR per kW
  
  // Steam Consumption
  steamConsumption: { baseValue: 85, variance: 15, min: 50, max: 150, decimals: 1 },
  steamCostRate: 85, // IDR per kg
  
  // Water Consumption
  waterConsumption: { baseValue: 8.5, variance: 2.0, min: 4, max: 15, decimals: 1 },
  waterCostRate: 12, // IDR per m³
  
  // Compressed Air
  compressedAirConsumption: { baseValue: 7500, variance: 1500, min: 4000, max: 12000, decimals: 0 },
  compressedAirCostRate: 0.15, // IDR per L
  
  // Natural Gas
  naturalGasConsumption: { baseValue: 45, variance: 10, min: 25, max: 75, decimals: 1 },
  naturalGasCostRate: 4500, // IDR per m³
};

// ============================================================================
// PERFORMANCE VARIABLE CONFIGURATION
// ============================================================================

export const PERFORMANCE_VARIABLE_CONFIG = {
  // OEE Metrics
  oeePercentage: { baseValue: 78, variance: 8, min: 55, max: 95, decimals: 1 },
  availabilityPercentage: { baseValue: 88, variance: 6, min: 70, max: 99, decimals: 1 },
  performancePercentage: { baseValue: 86, variance: 6, min: 65, max: 98, decimals: 1 },
  qualityPercentage: { baseValue: 96, variance: 2, min: 88, max: 99.5, decimals: 1 },
  
  // Production Metrics
  productionRateKgPerHour: { baseValue: 450, variance: 80, min: 250, max: 700, decimals: 0 },
  rejectRate: { baseValue: 2.5, variance: 1.5, min: 0.5, max: 8, decimals: 2 },
  
  // Downtime & Cycle
  downtimeMinutes: { baseValue: 20, variance: 15, min: 0, max: 60, decimals: 0 },
  cycleTime: { baseValue: 20, variance: 5, min: 10, max: 35, decimals: 0 },
  
  // Motor Variables
  mainMotorCurrent: { baseValue: 70, variance: 15, min: 40, max: 110, decimals: 1 },
  mainMotorVoltage: { baseValue: 385, variance: 8, min: 370, max: 400, decimals: 0 },
  mainMotorFrequency: { baseValue: 50, variance: 1, min: 48, max: 52, decimals: 1 },
  auxiliaryMotorCurrent: { baseValue: 25, variance: 8, min: 10, max: 45, decimals: 1 },
  
  // Vibration & Maintenance
  vibrationLevel: { baseValue: 4.5, variance: 1.5, min: 1.5, max: 8, decimals: 1 },
  bearingTemperature: { baseValue: 60, variance: 10, min: 40, max: 85, decimals: 0 },
  lubricationPressure: { baseValue: 3.5, variance: 0.5, min: 2, max: 5, decimals: 1 },
  filterPressureDrop: { baseValue: 1.5, variance: 0.4, min: 0.5, max: 3, decimals: 1 },
};

// ============================================================================
// PLANT DASHBOARD CONFIGURATION
// ============================================================================

export const PLANT_DASHBOARD_CONFIG = {
  // Utility Targets (per plant capacity factor)
  utilityTargets: {
    electricity: { baseTarget: 4000, unit: 'kW' },
    steam: { baseTarget: 2000, unit: 'kg/h' },
    water: { baseTarget: 150, unit: 'm³/h' },
    compressedAir: { baseTarget: 250, unit: 'm³/h' },
    nitrogen: { baseTarget: 40, unit: 'm³/h' },
    gas: { baseTarget: 75, unit: 'm³/h' },
  },
  
  // Shift Configuration
  shifts: [
    { number: 1, name: 'Shift 1', timeRange: '07:01 - 14:30' },
    { number: 2, name: 'Shift 2', timeRange: '14:31 - 22:00' },
    { number: 3, name: 'Shift 3', timeRange: '22:01 - 07:00' },
  ],
  
  // Alarm Templates
  alarmTemplates: [
    { title: 'Overcurrent Phase R', location: 'LVMDP-1', type: 'WARNING' as const },
    { title: 'Sealer Temp Low', location: 'Packing Pouch', type: 'WARNING' as const },
    { title: 'Oil Level Low', location: 'Fryer Section', type: 'WARNING' as const },
    { title: 'Motor Overload', location: 'Conveyor Belt', type: 'CRITICAL' as const },
    { title: 'Temperature High', location: 'Cooling System', type: 'WARNING' as const },
  ],
};

// ============================================================================
// MACHINE STATUS CONFIGURATION
// ============================================================================

export const MACHINE_STATUS_CONFIG = {
  // Status probabilities (sum should be 1)
  statusProbabilities: {
    RUNNING: 0.75,
    IDLE: 0.12,
    STOPPED: 0.08,
    MAINTENANCE: 0.05,
  },
  
  // Output ranges by status
  outputRanges: {
    RUNNING: { min: 2000, max: 7000 },
    IDLE: { min: 0, max: 500 },
    STOPPED: { min: 0, max: 0 },
    MAINTENANCE: { min: 0, max: 0 },
  },
  
  // OEE ranges by status
  oeeRanges: {
    RUNNING: { min: 70, max: 95 },
    IDLE: { min: 0, max: 30 },
    STOPPED: { min: 0, max: 0 },
    MAINTENANCE: { min: 0, max: 0 },
  },
  
  // Warning messages
  warningMessages: [
    'Maintenance Required',
    'Scheduled Maintenance',
    'Sensor Calibration Needed',
    'Filter Replacement Due',
  ],
};
