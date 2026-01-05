// src/packing/packing.types.ts
// Type definitions for Packing Module

export type MachineStatus = 'RUNNING' | 'ON' | 'OFF';

export interface WeigherState {
  id: number;
  status: MachineStatus;
  bpm: number;
  total_weight: number;
  giveaway_percent: number;
  std_dev: number;
}

export interface BagmakerAlarms {
  metal_detect: number;
  printer_error: boolean;
  product_in_seal: boolean;
  splice_detect: boolean;
}

export interface BagmakerEfficiency {
  total: number;
  weigher: number;
  bagmaker: number;
}

export interface BagmakerBagCounts {
  good: number;
  bad: number;
}

export interface BagmakerState {
  id: number;
  weigher_ref_id: number;
  status: MachineStatus;
  efficiency: BagmakerEfficiency;
  bag_counts: BagmakerBagCounts;
  alarms: BagmakerAlarms;
  wasted_film_percent: number;
}

export interface MachineConfig {
  weighers_count: number;
  bagmakers_count: number;
}

export interface PackingMachineState {
  machine_id: string;
  last_updated: string;
  config: MachineConfig;
  weighers: WeigherState[];
  bagmakers: BagmakerState[];
}

// Machine configuration from spec
export interface MachineSimulationConfig {
  machine_id: string;
  weighers: number;
  bagmakers: number;
  target_bpm: number;
  profile: 'high_speed' | 'standard' | 'low_speed' | 'high_volume' | 'variable';
}

// All machine configurations as per spec
export const MACHINE_CONFIGS: MachineSimulationConfig[] = [
  { machine_id: 'pc39', weighers: 11, bagmakers: 22, target_bpm: 90, profile: 'high_speed' },
  { machine_id: 'pc14', weighers: 5, bagmakers: 10, target_bpm: 80, profile: 'standard' },
  { machine_id: 'tortilla', weighers: 7, bagmakers: 14, target_bpm: 60, profile: 'low_speed' },
  { machine_id: 'tws56', weighers: 5, bagmakers: 10, target_bpm: 80, profile: 'standard' },
  { machine_id: 'fcp', weighers: 6, bagmakers: 12, target_bpm: 80, profile: 'standard' },
  { machine_id: 'tws72', weighers: 10, bagmakers: 20, target_bpm: 85, profile: 'high_volume' },
  { machine_id: 'copack', weighers: 3, bagmakers: 6, target_bpm: 70, profile: 'variable' },
  { machine_id: 'inhouse', weighers: 5, bagmakers: 10, target_bpm: 80, profile: 'standard' },
];
