// src/generators/types.ts
// Centralized type definitions for dummy data generation

export type PlantId = 'cikupa' | 'semarang' | 'cikokol' | 'agro';

export interface MachineIdentifier {
  plantId: PlantId;
  machineId: string;
}

// ============================================================================
// PROCESS DATA TYPES
// ============================================================================

export interface ProcessDataVariables {
  // Product Information
  productName: string;
  operatingMode: string;
  systemStatus: number;
  plcCommsStatus: string;
  
  // Prep / Slicing Systems
  feedFromCratesStatus: string;
  peelerOperationalStatus: string;
  potatoPrepControlMode: string;
  slicersControlMode: string;
  washerDrivesControlMode: string;
  potatoFeedOperationalStatus: string;
  slicersInclinePercentage: number;
  headTemperature: number;
  peelerRotationalSpeed: number;
  peelerLoadPercentage: number;
  washerLevelPercentage: number;
  washerFlowRate: number;
  
  // Oil Flow Control
  mainOilCirculationRate: number;
  oilCirculationControlValue: number;
  
  // Fryer Temperature Control
  fryerInletTemperature: number;
  fryerInletSetpoint: number;
  fryerOutletTemperature: number;
  temperatureDelta: number;
  burnerOutputPercentage: number;
  
  // Oil Make-up
  usedOilPercentage: number;
  newOilPercentage: number;
  oilLevelMillimeters: number;
  oilQualityStatus: string;
  valveOutputPercentage: number;
  
  // Moisture Control
  actualMoistureContent: number;
  moistureSetpoint: number;
  actualOilContent: number;
  oilContentSetpoint: number;
  
  // Other Systems / Drives
  masterSpeedPercentage: number;
  masterSpeedLinearValue: number;
  paddleSpeedPercentage: number;
  submergerSpeedPercentage: number;
  takeoutSpeedPercentage: number;
  fryerOutfeedControlMode: string;
  takeoutConveyorStatus: string;
  postFryerControlMode: string;
  
  // Quality Specifications
  sliceThickness: number;
  potatoSolidsPercentage: number;
  
  timestamp: string;
}

// ============================================================================
// UTILITY DATA TYPES
// ============================================================================

export interface UtilityDataVariables {
  // Electrical Power
  electricalPower: number;
  electricalPowerUnit: string;
  electricalPowerCost: number;
  electricalPowerCostUnit: string;
  
  // Steam Consumption
  steamConsumption: number;
  steamConsumptionUnit: string;
  steamConsumptionCost: number;
  steamConsumptionCostUnit: string;
  
  // Water Consumption
  waterConsumption: number;
  waterConsumptionUnit: string;
  waterConsumptionCost: number;
  waterConsumptionCostUnit: string;
  
  // Compressed Air
  compressedAirConsumption: number;
  compressedAirConsumptionUnit: string;
  compressedAirConsumptionCost: number;
  compressedAirConsumptionCostUnit: string;
  
  // Natural Gas
  naturalGasConsumption: number;
  naturalGasConsumptionUnit: string;
  naturalGasConsumptionCost: number;
  naturalGasConsumptionCostUnit: string;
  
  timestamp: string;
}

// ============================================================================
// PERFORMANCE DATA TYPES
// ============================================================================

export interface PerformanceDataVariables {
  // OEE Metrics
  oeePercentage: number;
  oeePercentageUnit: string;
  availabilityPercentage: number;
  availabilityPercentageUnit: string;
  performancePercentage: number;
  performancePercentageUnit: string;
  qualityPercentage: number;
  qualityPercentageUnit: string;
  
  // Production Metrics
  actualProduction: number;
  actualProductionUnit: string;
  targetProduction: number;
  targetProductionUnit: string;
  runRate: number;
  runRateUnit: string;
  rejectRate: number;
  rejectRateUnit: string;
  
  // Downtime & Cycle
  downtimeMinutes: number;
  downtimeMinutesUnit: string;
  cycleTime: number;
  cycleTimeUnit: string;
  
  // Motor Variables
  mainMotorCurrent: number;
  mainMotorCurrentUnit: string;
  mainMotorVoltage: number;
  mainMotorVoltageUnit: string;
  mainMotorFrequency: number;
  mainMotorFrequencyUnit: string;
  auxiliaryMotorCurrent: number;
  auxiliaryMotorCurrentUnit: string;
  
  // Vibration & Maintenance
  vibrationLevel: number;
  vibrationLevelUnit: string;
  bearingTemperature: number;
  bearingTemperatureUnit: string;
  lubricationPressure: number;
  lubricationPressureUnit: string;
  filterPressureDrop: number;
  filterPressureDropUnit: string;
  
  timestamp: string;
}

// ============================================================================
// PLANT DASHBOARD TYPES
// ============================================================================

export interface PlantDashboardVariables {
  // Summary Metrics
  totalEnergyToday: number;
  utilizationPercent: number;
  activeAlarms: number;
  activeMachines: number;
  totalMachines: number;
  
  // Utilities
  utilities: {
    electricity: { current: number; target: number; unit: string };
    steam: { current: number; target: number; unit: string };
    water: { current: number; target: number; unit: string };
    compressedAir: { current: number; target: number; unit: string };
    nitrogen: { current: number; target: number; unit: string };
    gas: { current: number; target: number; unit: string };
  };
  
  // Shift Performance
  shifts: Array<{
    shiftNumber: number;
    shiftName: string;
    timeRange: string;
    outputKg: number;
    oeePercentage: number;
    status: 'COMPLETED' | 'ACTIVE' | 'UPCOMING';
  }>;
  
  // Active Alarms
  alarms: Array<{
    title: string;
    timestamp: string;
    location: string;
    type: 'WARNING' | 'CRITICAL' | 'INFO';
  }>;
}

// ============================================================================
// MACHINE STATUS TYPES
// ============================================================================

export interface MachineStatusVariables {
  machineId: string;
  machineName: string;
  status: 'RUNNING' | 'STOPPED' | 'MAINTENANCE' | 'IDLE';
  outputKg: number;
  oeePercentage: number;
  warning?: string;
}

// ============================================================================
// CONFIGURATION TYPES
// ============================================================================

export interface VariableConfig {
  baseValue: number;
  variance: number;
  min?: number;
  max?: number;
  decimals?: number;
}

export interface MachineTypeConfig {
  processVariables: Record<string, VariableConfig>;
  utilityVariables: Record<string, VariableConfig>;
  performanceVariables: Record<string, VariableConfig>;
}
