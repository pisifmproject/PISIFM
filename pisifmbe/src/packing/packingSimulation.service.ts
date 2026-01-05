// src/packing/packingSimulation.service.ts
// Simulation Engine for Packing Module - generates "alive" dummy data

import {
  PackingMachineState,
  WeigherState,
  BagmakerState,
  MachineStatus,
  MACHINE_CONFIGS,
  MachineSimulationConfig,
} from './packing.types';

// In-memory state storage for all machines
const machineStates = new Map<string, PackingMachineState>();

// Simulation interval reference
let simulationInterval: NodeJS.Timeout | null = null;

// Constants
const SIMULATION_TICK_MS = 2000; // 2 seconds
const AVG_BAG_WEIGHT_KG = 0.05; // 50g chip bag

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Random float between min and max
 */
function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Create initial weigher state
 */
function createWeigher(id: number, targetBpm: number): WeigherState {
  return {
    id,
    status: 'RUNNING',
    bpm: targetBpm + randomFloat(-5, 5),
    total_weight: randomFloat(10000, 50000),
    giveaway_percent: randomFloat(0.5, 2.0),
    std_dev: randomFloat(0.3, 0.8),
  };
}

/**
 * Create initial bagmaker state
 */
function createBagmaker(id: number, weigherRefId: number): BagmakerState {
  return {
    id,
    weigher_ref_id: weigherRefId,
    status: 'RUNNING',
    efficiency: {
      total: randomFloat(88, 96),
      weigher: randomFloat(92, 98),
      bagmaker: randomFloat(88, 95),
    },
    bag_counts: {
      good: Math.floor(randomFloat(10000, 30000)),
      bad: Math.floor(randomFloat(100, 500)),
    },
    alarms: {
      metal_detect: 0,
      printer_error: false,
      product_in_seal: false,
      splice_detect: false,
    },
    wasted_film_percent: randomFloat(0.3, 1.5),
  };
}

/**
 * Initialize a single machine state based on config
 */
function initializeMachine(config: MachineSimulationConfig): PackingMachineState {
  const weighers: WeigherState[] = [];
  const bagmakers: BagmakerState[] = [];

  // Create weighers
  for (let i = 1; i <= config.weighers; i++) {
    weighers.push(createWeigher(i, config.target_bpm));
  }

  // Create bagmakers (2 bagmakers per weigher typically)
  const bagmakersPerWeigher = config.bagmakers / config.weighers;
  let bagmakerId = 1;
  for (let w = 1; w <= config.weighers; w++) {
    for (let b = 0; b < bagmakersPerWeigher; b++) {
      bagmakers.push(createBagmaker(bagmakerId++, w));
    }
  }

  return {
    machine_id: config.machine_id,
    last_updated: new Date().toISOString(),
    config: {
      weighers_count: config.weighers,
      bagmakers_count: config.bagmakers,
    },
    weighers,
    bagmakers,
  };
}

/**
 * Initialize all machines from config
 */
export function initializeMachines(): void {
  console.log('[PackingSim] Initializing machines...');
  
  for (const config of MACHINE_CONFIGS) {
    const state = initializeMachine(config);
    machineStates.set(config.machine_id, state);
    console.log(`[PackingSim] Initialized ${config.machine_id}: ${config.weighers}W/${config.bagmakers}BM`);
  }
  
  console.log(`[PackingSim] Total machines initialized: ${machineStates.size}`);
}

/**
 * Get machine config by ID
 */
function getMachineConfig(machineId: string): MachineSimulationConfig | undefined {
  return MACHINE_CONFIGS.find(c => c.machine_id === machineId);
}


/**
 * Update weigher state with fluctuation logic
 */
function updateWeigher(weigher: WeigherState, targetBpm: number): void {
  const config = { minBpm: targetBpm - 10, maxBpm: targetBpm + 5 };

  if (weigher.status === 'RUNNING') {
    // Drift BPM (random walk)
    const bpmDrift = (Math.random() - 0.5) * 2;
    weigher.bpm = clamp(weigher.bpm + bpmDrift, config.minBpm, config.maxBpm);

    // Increment total weight (bpm * avg_bag_weight * time_delta_minutes)
    const timeDeltaMinutes = SIMULATION_TICK_MS / 60000;
    weigher.total_weight += weigher.bpm * AVG_BAG_WEIGHT_KG * timeDeltaMinutes;

    // Drift giveaway percent
    const giveawayDrift = (Math.random() - 0.5) * 0.1;
    weigher.giveaway_percent = clamp(weigher.giveaway_percent + giveawayDrift, 0.3, 3.0);

    // Drift std_dev
    const stdDrift = (Math.random() - 0.5) * 0.05;
    weigher.std_dev = clamp(weigher.std_dev + stdDrift, 0.2, 1.0);
  }

  // Status state machine
  if (weigher.status === 'RUNNING') {
    // 0.5% chance to go OFF
    if (Math.random() < 0.005) {
      weigher.status = 'OFF';
    }
  } else if (weigher.status === 'OFF') {
    // 5% chance to turn back ON -> RUNNING
    if (Math.random() < 0.05) {
      weigher.status = 'RUNNING';
    }
  } else if (weigher.status === 'ON') {
    // Idle state, 10% chance to go RUNNING
    if (Math.random() < 0.1) {
      weigher.status = 'RUNNING';
    }
  }
}

/**
 * Update bagmaker state with fluctuation logic
 */
function updateBagmaker(bagmaker: BagmakerState, linkedWeigher: WeigherState): void {
  // Cascade effect: if weigher is OFF, bagmaker goes IDLE (ON)
  if (linkedWeigher.status === 'OFF') {
    bagmaker.status = 'ON'; // Idle - no product flow
  } else if (bagmaker.status === 'ON' && linkedWeigher.status === 'RUNNING') {
    // Resume if weigher is running
    if (Math.random() < 0.2) {
      bagmaker.status = 'RUNNING';
    }
  }

  if (bagmaker.status === 'RUNNING') {
    // Drift efficiency values
    const effDrift = (Math.random() - 0.5) * 0.1;
    bagmaker.efficiency.total = clamp(bagmaker.efficiency.total + effDrift, 85, 99);
    bagmaker.efficiency.weigher = clamp(bagmaker.efficiency.weigher + effDrift * 0.5, 90, 99);
    bagmaker.efficiency.bagmaker = clamp(bagmaker.efficiency.bagmaker + effDrift, 85, 98);

    // Increment bag counts based on weigher BPM
    const timeDeltaMinutes = SIMULATION_TICK_MS / 60000;
    const bagsProduced = Math.floor(linkedWeigher.bpm * timeDeltaMinutes);
    bagmaker.bag_counts.good += bagsProduced;

    // Small chance of bad bags
    if (Math.random() < 0.02) {
      bagmaker.bag_counts.bad += 1;
    }

    // Drift wasted film percent
    const filmDrift = (Math.random() - 0.5) * 0.05;
    bagmaker.wasted_film_percent = clamp(bagmaker.wasted_film_percent + filmDrift, 0.2, 2.0);

    // Random status change (rare)
    if (Math.random() < 0.003) {
      bagmaker.status = 'OFF';
    }
  } else if (bagmaker.status === 'OFF') {
    // 5% chance to recover
    if (Math.random() < 0.05) {
      bagmaker.status = 'ON';
    }
  }

  // Alarm logic
  updateAlarms(bagmaker);
}

/**
 * Update alarm states with random events
 */
function updateAlarms(bagmaker: BagmakerState): void {
  // Metal detect: 0.01% chance to increment
  if (Math.random() < 0.0001) {
    bagmaker.alarms.metal_detect += 1;
  }

  // Printer error: 0.1% chance to toggle true
  if (!bagmaker.alarms.printer_error && Math.random() < 0.001) {
    bagmaker.alarms.printer_error = true;
  } else if (bagmaker.alarms.printer_error && Math.random() < 0.1) {
    // 10% chance to resolve
    bagmaker.alarms.printer_error = false;
  }

  // Product in seal: 0.1% chance to toggle true
  if (!bagmaker.alarms.product_in_seal && Math.random() < 0.001) {
    bagmaker.alarms.product_in_seal = true;
  } else if (bagmaker.alarms.product_in_seal && Math.random() < 0.1) {
    bagmaker.alarms.product_in_seal = false;
  }

  // Splice detect: 0.05% chance to toggle true
  if (!bagmaker.alarms.splice_detect && Math.random() < 0.0005) {
    bagmaker.alarms.splice_detect = true;
  } else if (bagmaker.alarms.splice_detect && Math.random() < 0.15) {
    bagmaker.alarms.splice_detect = false;
  }
}


/**
 * Update all states for a single machine
 */
function updateMachineState(state: PackingMachineState): void {
  const config = getMachineConfig(state.machine_id);
  if (!config) return;

  // Special handling for 'variable' profile (Copack - stop/start often)
  if (config.profile === 'variable') {
    // 2% chance to toggle all units OFF/ON
    if (Math.random() < 0.02) {
      const newStatus: MachineStatus = state.weighers[0]?.status === 'RUNNING' ? 'OFF' : 'RUNNING';
      state.weighers.forEach(w => w.status = newStatus);
      state.bagmakers.forEach(b => b.status = newStatus === 'RUNNING' ? 'RUNNING' : 'ON');
    }
  }

  // Update each weigher
  for (const weigher of state.weighers) {
    updateWeigher(weigher, config.target_bpm);
  }

  // Update each bagmaker with reference to its linked weigher
  for (const bagmaker of state.bagmakers) {
    const linkedWeigher = state.weighers.find(w => w.id === bagmaker.weigher_ref_id);
    if (linkedWeigher) {
      updateBagmaker(bagmaker, linkedWeigher);
    }
  }

  // Update timestamp
  state.last_updated = new Date().toISOString();
}

/**
 * Main simulation tick - updates all machines
 */
function simulationTick(): void {
  for (const [machineId, state] of machineStates) {
    try {
      updateMachineState(state);
    } catch (err) {
      // Error in one machine should NOT affect others (isolation principle)
      console.error(`[PackingSim] Error updating ${machineId}:`, err);
    }
  }
}

/**
 * Start the simulation loop
 */
export function startSimulation(): void {
  if (simulationInterval) {
    console.log('[PackingSim] Simulation already running');
    return;
  }

  // Initialize machines if not already done
  if (machineStates.size === 0) {
    initializeMachines();
  }

  simulationInterval = setInterval(simulationTick, SIMULATION_TICK_MS);
  console.log(`[PackingSim] Simulation started (tick every ${SIMULATION_TICK_MS}ms)`);
}

/**
 * Stop the simulation loop
 */
export function stopSimulation(): void {
  if (simulationInterval) {
    clearInterval(simulationInterval);
    simulationInterval = null;
    console.log('[PackingSim] Simulation stopped');
  }
}

/**
 * Get state for a specific machine
 */
export function getMachineState(machineId: string): PackingMachineState | undefined {
  return machineStates.get(machineId.toLowerCase());
}

/**
 * Get all machine states
 */
export function getAllMachineStates(): PackingMachineState[] {
  return Array.from(machineStates.values());
}

/**
 * Get list of available machine IDs
 */
export function getAvailableMachineIds(): string[] {
  return MACHINE_CONFIGS.map(c => c.machine_id);
}

/**
 * Check if simulation is running
 */
export function isSimulationRunning(): boolean {
  return simulationInterval !== null;
}

/**
 * Reset a specific machine to initial state
 */
export function resetMachine(machineId: string): boolean {
  const config = getMachineConfig(machineId.toLowerCase());
  if (!config) return false;

  const state = initializeMachine(config);
  machineStates.set(config.machine_id, state);
  return true;
}

/**
 * Reset all machines to initial state
 */
export function resetAllMachines(): void {
  machineStates.clear();
  initializeMachines();
}
