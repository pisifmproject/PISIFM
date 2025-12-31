// src/generators/index.ts
// Centralized export for all dummy data generators

// Types
export * from './types';

// Configuration
export {
  seededRandom,
  randomValue,
  randomValueConstrained,
  PLANT_CONFIG,
  PROCESS_VARIABLE_CONFIG,
  UTILITY_VARIABLE_CONFIG,
  PERFORMANCE_VARIABLE_CONFIG,
  PLANT_DASHBOARD_CONFIG,
  MACHINE_STATUS_CONFIG,
} from './config';

// Machine Data Generator
export {
  generateProcessData,
  generateUtilityData,
  generatePerformanceData,
  clearMachineState,
  getActiveMachineKeys,
} from './machineDataGenerator';

// Plant Data Generator
export {
  generatePlantDashboardData,
  generateMachineStatus,
  clearPlantState,
} from './plantDataGenerator';

// Utility Data Generator
export {
  generateUtilityConsumption,
  generateUtilityTrend,
  generateUtilitySummary,
  generateUtilityDetailData,
  clearUtilityState,
} from './utilityDataGenerator';
