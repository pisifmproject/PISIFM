// src/generators/utilityDataGenerator.ts
// Centralized utility data generator for energy module (except LVMDP electricity)

import type { PlantId } from './types';
import { seededRandom, randomValue, PLANT_CONFIG } from './config';

// ============================================================================
// UTILITY TYPES
// ============================================================================

export interface UtilityTrendData {
  period: string;
  labels: string[];
  data: number[];
  unit: string;
}

export interface UtilityConsumptionData {
  daily: { current: number; target: number; yesterday: number };
  monthly: { current: number; target: number; lastMonth: number };
  unit: string;
}

export interface UtilitySummaryData {
  steam: UtilityMetric;
  water: UtilityMetric;
  compressedAir: UtilityMetric;
  nitrogen: UtilityMetric;
  gas: UtilityMetric;
}

interface UtilityMetric {
  current: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  percentChange: number;
}

// ============================================================================
// UTILITY CONFIGURATION
// ============================================================================

const UTILITY_CONFIG = {
  steam: {
    baseDaily: 500, // tons
    baseMonthly: 15000,
    unit: 'Ton',
    variance: 0.15,
  },
  water: {
    baseDaily: 12000, // m³
    baseMonthly: 360000,
    unit: 'm³',
    variance: 0.12,
  },
  compressedAir: {
    baseDaily: 500000, // Nm³
    baseMonthly: 15000000,
    unit: 'Nm³',
    variance: 0.1,
  },
  nitrogen: {
    baseDaily: 15000, // Nm³
    baseMonthly: 450000,
    unit: 'Nm³',
    variance: 0.1,
  },
  gas: {
    baseDaily: 35000, // Nm³
    baseMonthly: 1050000,
    unit: 'Nm³',
    variance: 0.12,
  },
};

// ============================================================================
// ISOLATED STATE STORAGE
// ============================================================================

interface UtilityState {
  baseValues: Record<string, number>;
  lastUpdate: number;
}

const utilityStateMap = new Map<string, UtilityState>();

function getUtilityState(plantId: PlantId, utilityType: string): UtilityState {
  const key = `${plantId}-${utilityType}`;
  
  if (!utilityStateMap.has(key)) {
    const seed = key;
    const capacityFactor = PLANT_CONFIG[plantId].installedCapacityKva / 5540;
    
    utilityStateMap.set(key, {
      baseValues: {
        dailyBase: seededRandom(seed + 'daily', 0.8, 1.2) * capacityFactor,
        monthlyBase: seededRandom(seed + 'monthly', 0.85, 1.15) * capacityFactor,
        trendBase: seededRandom(seed + 'trend', -5, 5),
      },
      lastUpdate: Date.now(),
    });
  }
  
  return utilityStateMap.get(key)!;
}

// ============================================================================
// DATA GENERATORS
// ============================================================================

/**
 * Generate utility consumption data
 * Note: Electricity for Cikupa uses real LVMDP data - handled at route level
 */
export function generateUtilityConsumption(
  plantId: PlantId,
  utilityType: keyof typeof UTILITY_CONFIG
): UtilityConsumptionData {
  const config = UTILITY_CONFIG[utilityType];
  const state = getUtilityState(plantId, utilityType);
  
  const dailyCurrent = Math.round(randomValue(
    config.baseDaily * state.baseValues.dailyBase,
    config.baseDaily * config.variance
  ));
  
  const dailyTarget = Math.round(config.baseDaily * state.baseValues.dailyBase * 1.1);
  const dailyYesterday = Math.round(randomValue(dailyCurrent, dailyCurrent * 0.08));
  
  const monthlyCurrent = Math.round(randomValue(
    config.baseMonthly * state.baseValues.monthlyBase,
    config.baseMonthly * config.variance
  ));
  
  const monthlyTarget = Math.round(config.baseMonthly * state.baseValues.monthlyBase * 1.1);
  const monthlyLastMonth = Math.round(randomValue(monthlyCurrent, monthlyCurrent * 0.1));
  
  return {
    daily: {
      current: dailyCurrent,
      target: dailyTarget,
      yesterday: dailyYesterday,
    },
    monthly: {
      current: monthlyCurrent,
      target: monthlyTarget,
      lastMonth: monthlyLastMonth,
    },
    unit: config.unit,
  };
}

/**
 * Generate utility trend data
 */
export function generateUtilityTrend(
  plantId: PlantId,
  utilityType: keyof typeof UTILITY_CONFIG,
  range: '7days' | '30days' | '12months'
): UtilityTrendData {
  const config = UTILITY_CONFIG[utilityType];
  const state = getUtilityState(plantId, utilityType);
  
  let labels: string[];
  let baseValue: number;
  let period: string;
  
  const now = new Date();
  
  switch (range) {
    case '7days':
      period = 'Last 7 Days';
      labels = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (6 - i));
        return d.toLocaleDateString('id-ID', { day: '2-digit', month: 'short' });
      });
      baseValue = config.baseDaily * state.baseValues.dailyBase;
      break;
      
    case '30days':
      period = 'Last 30 Days';
      labels = Array.from({ length: 30 }, (_, i) => {
        const d = new Date(now);
        d.setDate(d.getDate() - (29 - i));
        return d.toLocaleDateString('id-ID', { day: '2-digit' });
      });
      baseValue = config.baseDaily * state.baseValues.dailyBase;
      break;
      
    case '12months':
      period = 'Last 12 Months';
      labels = Array.from({ length: 12 }, (_, i) => {
        const d = new Date(now);
        d.setMonth(d.getMonth() - (11 - i));
        return d.toLocaleDateString('id-ID', { month: 'short' });
      });
      baseValue = config.baseMonthly * state.baseValues.monthlyBase;
      break;
  }
  
  // Generate trend data with some variance and slight trend
  const trendDirection = state.baseValues.trendBase > 0 ? 1 : -1;
  const data = labels.map((_, idx) => {
    const trendFactor = 1 + (trendDirection * idx * 0.005); // Slight trend over time
    return Math.round(randomValue(baseValue * trendFactor, baseValue * config.variance));
  });
  
  return {
    period,
    labels,
    data,
    unit: config.unit,
  };
}

/**
 * Generate utility summary for dashboard
 */
export function generateUtilitySummary(plantId: PlantId): UtilitySummaryData {
  const capacityFactor = PLANT_CONFIG[plantId].installedCapacityKva / 5540;
  
  const generateMetric = (type: keyof typeof UTILITY_CONFIG): UtilityMetric => {
    const config = UTILITY_CONFIG[type];
    const state = getUtilityState(plantId, type);
    
    const current = Math.round(randomValue(
      config.baseDaily * state.baseValues.dailyBase / 24, // Hourly rate
      config.baseDaily * config.variance / 24
    ));
    
    const target = Math.round(config.baseDaily * state.baseValues.dailyBase * 1.1 / 24);
    const percentChange = parseFloat(randomValue(state.baseValues.trendBase, 3).toFixed(1));
    
    return {
      current,
      target,
      unit: config.unit === 'Ton' ? 'kg/h' : config.unit === 'm³' ? 'm³/h' : 'Nm³/h',
      trend: percentChange > 1 ? 'up' : percentChange < -1 ? 'down' : 'stable',
      percentChange: Math.abs(percentChange),
    };
  };
  
  return {
    steam: generateMetric('steam'),
    water: generateMetric('water'),
    compressedAir: generateMetric('compressedAir'),
    nitrogen: generateMetric('nitrogen'),
    gas: generateMetric('gas'),
  };
}

/**
 * Generate detailed utility data for specific utility page
 */
export function generateUtilityDetailData(
  plantId: PlantId,
  utilityType: keyof typeof UTILITY_CONFIG
) {
  const config = UTILITY_CONFIG[utilityType];
  const state = getUtilityState(plantId, utilityType);
  const capacityFactor = PLANT_CONFIG[plantId].installedCapacityKva / 5540;
  
  // Current readings
  const currentRate = Math.round(randomValue(
    config.baseDaily * state.baseValues.dailyBase / 24,
    config.baseDaily * config.variance / 24
  ));
  
  // Shift data
  const now = new Date();
  const hour = now.getHours();
  let currentShift: 1 | 2 | 3;
  if (hour >= 7 && hour < 15) currentShift = 1;
  else if (hour >= 15 && hour < 22) currentShift = 2;
  else currentShift = 3;
  
  const shiftData = [1, 2, 3].map(shiftNum => {
    const isCompleted = shiftNum < currentShift;
    const isActive = shiftNum === currentShift;
    const hoursInShift = isActive ? (hour - (shiftNum === 1 ? 7 : shiftNum === 2 ? 15 : 22) + 24) % 24 : 7.5;
    
    return {
      shift: shiftNum,
      consumption: isCompleted || isActive 
        ? Math.round(currentRate * hoursInShift * (0.9 + Math.random() * 0.2))
        : 0,
      status: isCompleted ? 'COMPLETED' : isActive ? 'ACTIVE' : 'UPCOMING',
    };
  });
  
  return {
    currentRate,
    unit: config.unit === 'Ton' ? 'kg/h' : config.unit === 'm³' ? 'm³/h' : 'Nm³/h',
    dailyTotal: Math.round(currentRate * hour),
    dailyTarget: Math.round(config.baseDaily * state.baseValues.dailyBase),
    monthlyTotal: Math.round(config.baseMonthly * state.baseValues.monthlyBase * 0.8),
    monthlyTarget: Math.round(config.baseMonthly * state.baseValues.monthlyBase),
    shiftData,
    efficiency: parseFloat((85 + Math.random() * 10).toFixed(1)),
    costPerUnit: utilityType === 'steam' ? 85 
      : utilityType === 'water' ? 12 
      : utilityType === 'compressedAir' ? 0.15 
      : utilityType === 'nitrogen' ? 25 
      : 4500,
  };
}

/**
 * Clear utility state
 */
export function clearUtilityState(plantId?: PlantId, utilityType?: string): void {
  if (plantId && utilityType) {
    utilityStateMap.delete(`${plantId}-${utilityType}`);
  } else {
    utilityStateMap.clear();
  }
}
