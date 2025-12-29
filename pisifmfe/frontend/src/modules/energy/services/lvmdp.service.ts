import { PLANTS } from "@/config/app.config";
import { getLvmdpLatest, getLvmdpHMI, type LvmdpRaw } from "@/lib/api";
import type { LVMDPData, LVMDPCallback } from "../models";

export class LvmdpService {
  private intervals: Map<string, number> = new Map();
  private firstLoadTracked: Map<string, boolean> = new Map();
  private activeCallbacks: Map<string, LVMDPCallback> = new Map();
  private subscriptionIds: Map<string, number> = new Map();
  private nextSubscriptionId = 0;
  private cache: Map<string, { data: LVMDPData; timestamp: number }> =
    new Map();
  private readonly CACHE_TTL = 2000; // 2 seconds cache

  constructor() {}

  /**
   * Subscribe to real-time updates for a specific LVMDP.
   * Returns a cleanup function to stop subscription.
   */
  subscribe(
    plantId: string,
    lvmdpIndex: number,
    callback: LVMDPCallback
  ): () => void {
    const key = `${plantId}-${lvmdpIndex}`;
    const subscriptionId = ++this.nextSubscriptionId;

    // Stop existing interval first, but keep callbacks until we set new ones
    if (this.intervals.has(key)) {
      clearInterval(this.intervals.get(key)!);
      this.intervals.delete(key);
    }

    // Store the active callback and subscription ID for this key
    this.activeCallbacks.set(key, callback);
    this.subscriptionIds.set(key, subscriptionId);

    const plantConfig = PLANTS[plantId as keyof typeof PLANTS];
    const useRealData = plantConfig?.useRealData ?? false;

    // Track if we've logged the first successful load
    this.firstLoadTracked.set(key, false);

    // Check cache first for instant loading
    const cached = this.cache.get(key);
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      callback(cached.data);
    }

    // Fetch immediately on subscribe (faster initial response)
    const fetchData = async () => {
      // Check if this subscription is still active
      const currentSubscriptionId = this.subscriptionIds.get(key);
      if (currentSubscriptionId !== subscriptionId) {
        return; // This subscription was replaced, ignore this callback
      }

      try {
        if (useRealData && plantId === "cikupa") {
          try {
            const raw = await getLvmdpLatest(lvmdpIndex);

            const stillActive = this.subscriptionIds.get(key) === subscriptionId;
            if (!stillActive) return;

            if (!raw) {
              console.warn(`[LVMDP${lvmdpIndex}] No data from API`);
              const dummy = this.generateDummyData(lvmdpIndex);
              const currentCallback = this.activeCallbacks.get(key);
              if (currentCallback) currentCallback(dummy);
              return;
            }

            const model = this.mapToModel(lvmdpIndex, raw);
            this.cache.set(key, { data: model, timestamp: Date.now() });

            if (!this.firstLoadTracked.get(key)) {
              console.log(`✅ LVMDP ${lvmdpIndex}: ${model.activePower.toFixed(0)} kW, ${model.avgCurrent.toFixed(0)} A (real data)`);
              this.firstLoadTracked.set(key, true);
            }

            const currentCallback = this.activeCallbacks.get(key);
            const stillActiveAfterModel = this.subscriptionIds.get(key) === subscriptionId;
            if (currentCallback && stillActiveAfterModel) {
              currentCallback(model);
            }
          } catch (apiError: any) {
            if (!this.firstLoadTracked.get(key)) {
              console.error(`❌ LVMDP ${lvmdpIndex}: ${apiError.message}`);
            }
            const dummy = this.generateDummyData(lvmdpIndex);
            const currentCallback = this.activeCallbacks.get(key);
            if (currentCallback) {
              currentCallback(dummy);
            }
          }
        } else {
          const dummy = this.generateDummyData(lvmdpIndex);
          const currentCallback = this.activeCallbacks.get(key);
          if (currentCallback) currentCallback(dummy);
        }
      } catch (err: any) {
        console.error(`❌ LVMDP ${lvmdpIndex} unexpected:`, err.message);
        const dummy = this.generateDummyData(lvmdpIndex);
        const currentCallback = this.activeCallbacks.get(key);
        if (currentCallback) {
          currentCallback(dummy);
        }
      }
    };

    // Fetch immediately
    fetchData();

    // Then poll every 2 seconds (balanced between freshness and performance)
    const intervalId = window.setInterval(fetchData, 2000);

    this.intervals.set(key, intervalId);

    return () => this.stop(key);
  }

  private stop(key: string) {
    if (this.intervals.has(key)) {
      clearInterval(this.intervals.get(key));
      this.intervals.delete(key);
    }
    // Clear callback and subscription ID when stopping
    this.activeCallbacks.delete(key);
    this.subscriptionIds.delete(key);
    this.firstLoadTracked.delete(key);
  }

  private mapToModel(index: number, raw: any): LVMDPData {
    // raw might be undefined if 404
    if (!raw) return this.createOfflineState(index);

    const vll = Number(raw.avgLineLine) || 0;
    const current = Number(raw.avgCurrent) || 0;
    const pf = Number(raw.cosPhi) || 0;

    // Use realPower if available (preferred source), otherwise calculate from kVA
    let kw: number;
    if (raw.realPower !== undefined && raw.realPower !== null) {
      kw = Number(raw.realPower);
    } else {
      const kva = (Math.sqrt(3) * vll * current) / 1000;
      kw = kva * pf;
    }

    const kva = (Math.sqrt(3) * vll * current) / 1000;
    // kvar = sqrt(kva^2 - kw^2)
    const kvar = Math.sqrt(Math.max(0, kva * kva - kw * kw));

    // LVMDP 4 uses MWh, LVMDP 1-3 use GWh
    const energyUnit = index === 4 ? "MWh" : "GWh";

    return {
      id: `lvmdp-${index}`,
      name: `LVMDP ${index}`,
      timestamp: Date.now(),
      isConnected: true,
      activePower: kw,
      apparentPower: kva,
      reactivePower: kvar,
      powerFactor: pf,
      frequency: Number(raw.freq) || 50,
      avgVoltage: vll,
      avgCurrent: current,
      totalEnergy: Number(raw.totalKwh) || 0,
      energyUnit,
      phases: {
        r: {
          current: Number(raw.currentR) || 0,
          voltageRS: Number(raw.voltageRS) || 0,
        },
        s: {
          current: Number(raw.currentS) || 0,
          voltageST: Number(raw.voltageST) || 0,
        },
        t: {
          current: Number(raw.currentT) || 0,
          voltageTR: Number(raw.voltageTR) || 0,
        },
      },
    };
  }

  private generateDummyData(index: number): LVMDPData {
    const baseLoad = 1000 + Math.random() * 500; // Random load
    const pf = 0.85 + Math.random() * 0.1;
    const kva = baseLoad;
    const kw = kva * pf;
    const kvar = Math.sqrt(kva * kva - kw * kw);
    const voltage = 380 + (Math.random() * 10 - 5);
    const current = (kva * 1000) / (Math.sqrt(3) * voltage);

    // LVMDP 4 uses MWh, LVMDP 1-3 use GWh
    const energyUnit = index === 4 ? "MWh" : "GWh";

    return {
      id: `lvmdp-${index}`,
      name: `LVMDP ${index}`,
      timestamp: Date.now(),
      isConnected: true,
      activePower: kw,
      apparentPower: kva,
      reactivePower: kvar,
      powerFactor: pf,
      frequency: 50 + (Math.random() * 0.2 - 0.1),
      avgVoltage: voltage,
      avgCurrent: current,
      totalEnergy: 12345 + Math.random(),
      energyUnit,
      phases: {
        r: {
          current: current * (0.9 + Math.random() * 0.2),
          voltageRS: voltage,
        },
        s: {
          current: current * (0.9 + Math.random() * 0.2),
          voltageST: voltage,
        },
        t: {
          current: current * (0.9 + Math.random() * 0.2),
          voltageTR: voltage,
        },
      },
    };
  }

  private createOfflineState(index: number): LVMDPData {
    const energyUnit = index === 4 ? "MWh" : "GWh";
    return {
      id: `lvmdp-${index}`,
      name: `LVMDP ${index}`,
      timestamp: Date.now(),
      isConnected: false,
      activePower: 0,
      apparentPower: 0,
      reactivePower: 0,
      powerFactor: 0,
      frequency: 0,
      avgVoltage: 0,
      avgCurrent: 0,
      totalEnergy: 0,
      energyUnit,
      phases: {
        r: { current: 0, voltageRS: 0 },
        s: { current: 0, voltageST: 0 },
        t: { current: 0, voltageTR: 0 },
      },
    };
  }
}

export const lvmdpService = new LvmdpService();
