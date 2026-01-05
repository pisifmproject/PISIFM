// src/packing/packing.services.ts
// Service layer for Packing Module - wraps simulation service

import * as simulation from './packingSimulation.service';
import type { PackingMachineState } from './packing.types';

/**
 * Get state for a specific machine
 */
export function getMachineState(machineId: string): PackingMachineState | undefined {
  return simulation.getMachineState(machineId);
}

/**
 * Get all machine states
 */
export function getAllMachineStates(): PackingMachineState[] {
  return simulation.getAllMachineStates();
}

/**
 * Get available machine IDs
 */
export function getAvailableMachineIds(): string[] {
  return simulation.getAvailableMachineIds();
}

/**
 * Calculate efficiency for packing line
 */
export function calculateEfficiency(actual: number, target: number): number {
  if (target === 0) return 0;
  return (actual / target) * 100;
}

/**
 * Get packing summary for a machine
 */
export function getPackingSummary(machineId: string) {
  const state = simulation.getMachineState(machineId);
  if (!state) return null;

  const runningWeighers = state.weighers.filter(w => w.status === 'RUNNING').length;
  const runningBagmakers = state.bagmakers.filter(b => b.status === 'RUNNING').length;
  
  const avgBpm = state.weighers.length > 0
    ? state.weighers.reduce((sum, w) => sum + w.bpm, 0) / state.weighers.length
    : 0;

  const totalGoodBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.good, 0);
  const totalBadBags = state.bagmakers.reduce((sum, b) => sum + b.bag_counts.bad, 0);

  return {
    machine_id: state.machine_id,
    last_updated: state.last_updated,
    weighers: {
      total: state.weighers.length,
      running: runningWeighers,
    },
    bagmakers: {
      total: state.bagmakers.length,
      running: runningBagmakers,
    },
    production: {
      avg_bpm: Math.round(avgBpm * 10) / 10,
      total_good_bags: totalGoodBags,
      total_bad_bags: totalBadBags,
    },
  };
}
