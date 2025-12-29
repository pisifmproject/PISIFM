<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute } from "vue-router";
import { lvmdpService } from "../services/lvmdp.service";
import type { LVMDPData } from "../models";
import GaugeSimple from "@/shared/components/GaugeSimple.vue";
import { Zap, Activity, Clock } from "lucide-vue-next";
import { PLANTS } from "@/config/app.config";

// Props/Route params
const route = useRoute();
const plantId = computed(() => route.params.plantId as string);
const lvmdpId = computed(() => Number(route.params.lvmdpId));

// State
const data = ref<LVMDPData | null>(null);
const loading = ref(true);
const isTransitioning = ref(false);
const showSkeleton = ref(true);
const lastUpdate = ref<Date>(new Date());
const isRealData = computed(() => {
  const plantConfig = PLANTS[plantId.value as keyof typeof PLANTS];
  return plantConfig?.useRealData ?? false;
});
let unsubscribe: (() => void) | null = null;
let loadingTimeout: number | null = null;

// Watchers for dynamic routing changes
watch(
  [plantId, lvmdpId],
  ([newPlant, newId]) => {
    if (newPlant && newId) {
      isTransitioning.value = true;
      startSubscription(newPlant, newId);
    }
  },
  { immediate: true }
);

function startSubscription(plant: string, id: number) {
  // Stop previous subscription first
  if (unsubscribe) {
    unsubscribe();
    unsubscribe = null;
  }

  // Clear any existing timeout
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }

  // Clear old data immediately and show loading
  data.value = null;
  loading.value = true;
  isTransitioning.value = true;
  showSkeleton.value = true;

  // Set a timeout to hide loading if data doesn't arrive quickly
  // Reduced timeout to 2 seconds for better UX
  loadingTimeout = window.setTimeout(() => {
    if (loading.value) {
      loading.value = false;
      isTransitioning.value = false;
      showSkeleton.value = false;
      // Don't clear data if it exists, just hide loading
    }
  }, 2000); // 2 second timeout (reduced from 5)

  unsubscribe = lvmdpService.subscribe(plant, id, (newData) => {
    // Clear timeout since we got data
    if (loadingTimeout) {
      clearTimeout(loadingTimeout);
      loadingTimeout = null;
    }

    // Accept data if it exists (verification is done in service)
    if (newData) {
      data.value = newData;
      loading.value = false;
      isTransitioning.value = false;
      showSkeleton.value = false;
      lastUpdate.value = new Date();
    } else {
      // Still hide loading even if no data
      loading.value = false;
      isTransitioning.value = false;
      showSkeleton.value = false;
    }
  });
}

onUnmounted(() => {
  if (unsubscribe) unsubscribe();
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
});

// Helper for phase color
const getPhaseColor = (phase: string) => {
  switch (phase) {
    case "R":
      return "#ef4444";
    case "S":
      return "#eab308";
    case "T":
      return "#3b82f6";
    default:
      return "#94a3b8";
  }
};
</script>

<template>
  <div class="lvmdp-detail" :key="`lvmdp-${lvmdpId}`">
    <!-- Skeleton Loading Screen (Faster UX) -->
    <div v-if="showSkeleton && !data" class="skeleton-container">
      <!-- Skeleton Header -->
      <div class="skeleton-header">
        <div class="skeleton-icon"></div>
        <div class="skeleton-title-group">
          <div class="skeleton-title"></div>
          <div class="skeleton-status"></div>
        </div>
      </div>

      <!-- Skeleton Gauges -->
      <div class="skeleton-gauges">
        <div v-for="i in 4" :key="i" class="skeleton-gauge"></div>
      </div>

      <!-- Skeleton Phases -->
      <div class="skeleton-phases">
        <div v-for="i in 3" :key="i" class="skeleton-phase"></div>
      </div>
    </div>

    <!-- Header -->
    <div class="page-header" v-if="data">
      <div class="header-content">
        <div class="title-group">
          <div class="icon-box">
            <Zap class="w-8 h-8 text-white" />
          </div>
          <div>
            <div class="title-row">
              <h1 class="title">LVMDP {{ lvmdpId }}</h1>
              <div v-if="isRealData" class="live-badge">
                <div class="live-dot"></div>
                <span>LIVE</span>
              </div>
            </div>
            <div class="status-pill" :class="{ online: data.isConnected }">
              <div class="dot"></div>
              {{ data.isConnected ? "ONLINE" : "OFFLINE" }}
            </div>
          </div>
        </div>

        <div class="timestamp">
          <Clock class="w-4 h-4" />
          {{ lastUpdate.toLocaleTimeString() }}
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div v-if="data" class="dashboard-grid">
      <!-- Primary Gauges Row -->
      <section class="gauges-section">
        <div class="card gauge-card">
          <GaugeSimple
            title="Active Power"
            :value="data.activePower"
            :min="0"
            :max="2000"
            unit="kW"
          />
        </div>
        <div class="card gauge-card">
          <GaugeSimple
            title="Apparent Power"
            :value="data.apparentPower"
            :min="0"
            :max="5540"
            unit="kVA"
            subtitle="of 5540 kVA"
          />
        </div>
        <div class="card gauge-card">
          <GaugeSimple
            title="Avg Current"
            :value="data.avgCurrent"
            :min="0"
            :max="2500"
            unit="A"
          />
        </div>
        <div class="card gauge-card">
          <GaugeSimple
            title="Power Factor"
            :value="data.powerFactor"
            :min="0"
            :max="1"
            unit=""
          />
        </div>
      </section>

      <!-- Phase Details Row -->
      <section class="phases-grid">
        <!-- R Phase -->
        <div class="phase-card r-phase">
          <div class="phase-header">
            <span class="phase-label">Phase R</span>
            <div class="indicator bg-red-500"></div>
          </div>
          <div class="phase-metrics">
            <div class="metric">
              <span class="label">Current</span>
              <span class="val"
                >{{ data.phases.r.current.toFixed(1) }} <small>A</small></span
              >
            </div>
            <div class="metric">
              <span class="label">Volt (R-S)</span>
              <span class="val"
                >{{ data.phases.r.voltageRS.toFixed(1) }} <small>V</small></span
              >
            </div>
          </div>
        </div>

        <!-- S Phase -->
        <div class="phase-card s-phase">
          <div class="phase-header">
            <span class="phase-label">Phase S</span>
            <div class="indicator bg-yellow-500"></div>
          </div>
          <div class="phase-metrics">
            <div class="metric">
              <span class="label">Current</span>
              <span class="val"
                >{{ data.phases.s.current.toFixed(1) }} <small>A</small></span
              >
            </div>
            <div class="metric">
              <span class="label">Volt (S-T)</span>
              <span class="val"
                >{{ data.phases.s.voltageST.toFixed(1) }} <small>V</small></span
              >
            </div>
          </div>
        </div>

        <!-- T Phase -->
        <div class="phase-card t-phase">
          <div class="phase-header">
            <span class="phase-label">Phase T</span>
            <div class="indicator bg-blue-500"></div>
          </div>
          <div class="phase-metrics">
            <div class="metric">
              <span class="label">Current</span>
              <span class="val"
                >{{ data.phases.t.current.toFixed(1) }} <small>A</small></span
              >
            </div>
            <div class="metric">
              <span class="label">Volt (T-R)</span>
              <span class="val"
                >{{ data.phases.t.voltageTR.toFixed(1) }} <small>V</small></span
              >
            </div>
          </div>
        </div>
      </section>

      <!-- Secondary Metrics -->
      <section class="secondary-metrics">
        <div class="metric-strip">
          <span class="label">Frequency</span>
          <span class="value">{{ data.frequency.toFixed(2) }} Hz</span>
        </div>
        <div class="metric-strip">
          <span class="label">Avg Voltage (L-L)</span>
          <span class="value">{{ data.avgVoltage.toFixed(1) }} V</span>
        </div>
        <div class="metric-strip">
          <span class="label">Reactive Power</span>
          <span class="value">{{ data.reactivePower.toFixed(1) }} kVAR</span>
        </div>
        <div class="metric-strip highlight">
          <span class="label">Total Energy</span>
          <span class="value"
            >{{ data.totalEnergy.toLocaleString() }} {{ data.energyUnit }}</span
          >
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
.lvmdp-detail {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
}

/* Skeleton Loading Screen */
.skeleton-container {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.skeleton-header {
  background: #1e293b;
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.skeleton-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.75rem;
}

.skeleton-title-group {
  flex: 1;
}

.skeleton-title {
  width: 200px;
  height: 28px;
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 0.5rem;
  margin-bottom: 0.5rem;
}

.skeleton-status {
  width: 80px;
  height: 20px;
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 9999px;
}

.skeleton-gauges {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-gauge {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 1rem;
  height: 200px;
  background: linear-gradient(90deg, #1e293b 25%, #334155 50%, #1e293b 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-phases {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.skeleton-phase {
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  height: 120px;
  background: linear-gradient(90deg, #0f172a 25%, #1e293b 50%, #0f172a 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
  0% {
    background-position: -200% 0;
  }
  100% {
    background-position: 200% 0;
  }
}

.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #94a3b8;
  gap: 1rem;
}

.dashboard-grid {
  position: relative;
  animation: fadeIn 0.4s ease-in;
}

/* Header */
.page-header {
  margin-bottom: 2rem;
  background: #1e293b;
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.title-group {
  display: flex;
  align-items: center;
  gap: 1.25rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.live-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  padding: 0.2rem 0.6rem;
  border-radius: 9999px;
  font-size: 0.7rem;
  font-weight: 700;
  color: #4ade80;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.live-dot {
  width: 0.4rem;
  height: 0.4rem;
  background: #4ade80;
  border-radius: 50%;
  animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
  0%,
  100% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.5;
    transform: scale(1.2);
  }
}

.icon-box {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 1.75rem;
  font-weight: 800;
  color: white;
  margin: 0 0 0.25rem 0;
  line-height: 1;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: #334155;
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  color: #94a3b8;
}

.status-pill.online {
  background: rgba(34, 197, 94, 0.2);
  color: #4ade80;
}

.dot {
  width: 0.5rem;
  height: 0.5rem;
  border-radius: 50%;
  background: currentColor;
}

.timestamp {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-family: monospace;
}

/* Gauges */
.gauges-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #334155;
}

/* Phases */
.phases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.phase-card {
  background: #0f172a;
  border-radius: 0.75rem;
  padding: 1.25rem;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
}

.r-phase {
  border-top: 3px solid #ef4444;
}
.s-phase {
  border-top: 3px solid #eab308;
}
.t-phase {
  border-top: 3px solid #3b82f6;
}

.phase-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.phase-label {
  font-weight: 700;
  color: #e2e8f0;
}

.indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
}

.bg-red-500 {
  background-color: #ef4444;
}
.bg-yellow-500 {
  background-color: #eab308;
}
.bg-blue-500 {
  background-color: #3b82f6;
}

.phase-metrics {
  display: flex;
  justify-content: space-between;
}

.metric {
  display: flex;
  flex-direction: column;
}

.metric .label {
  font-size: 0.75rem;
  color: #94a3b8;
  margin-bottom: 0.25rem;
}

.metric .val {
  font-size: 1.25rem;
  font-weight: 600;
  color: white;
}

.metric small {
  font-size: 0.8rem;
  color: #64748b;
  font-weight: 500;
}

/* Secondary Metrics */
.secondary-metrics {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metric-strip {
  background: #1e293b;
  padding: 1rem 1.5rem;
  border-radius: 0.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border: 1px solid #334155;
}

.metric-strip.highlight {
  background: rgba(59, 130, 246, 0.1);
  border-color: rgba(59, 130, 246, 0.3);
}

.metric-strip .label {
  color: #94a3b8;
  font-size: 0.9rem;
}

.metric-strip .value {
  color: white;
  font-weight: 600;
  font-family: monospace;
}
</style>
