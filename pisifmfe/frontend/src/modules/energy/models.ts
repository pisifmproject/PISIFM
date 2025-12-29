export interface LVMDPPhaseData {
  current: number;
  voltage: number; // Line-to-Line usually, or Phase-to-Neutral depending on source. naming should be clear.
}

export interface LVMDPData {
  id: string;
  name: string;
  timestamp: number;
  isConnected: boolean;

  // Main aggregate metrics
  activePower: number; // kW
  apparentPower: number; // kVA
  reactivePower: number; // kVAR
  powerFactor: number;
  frequency: number; // Hz
  avgVoltage: number; // V
  avgCurrent: number; // A
  totalEnergy: number; // kWh / GWh / MWh
  energyUnit: string; // "GWh" | "MWh"

  // Phase details
  phases: {
    r: { current: number; voltageRS: number };
    s: { current: number; voltageST: number };
    t: { current: number; voltageTR: number };
  };
}

export type LVMDPCallback = (data: LVMDPData) => void;
