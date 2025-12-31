<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Cog, Activity, Zap, TrendingUp, AlertTriangle, Wrench } from 'lucide-vue-next';
import { getMachineProcessData, getMachineUtilityData, getMachinePerformanceData } from '@/lib/api';

const route = useRoute();
const router = useRouter();
const plantId = computed(() => route.params.plantId as PlantId);
const machineId = computed(() => route.params.machineId as string);
const activeTab = computed(() => (route.meta.tab as string) || 'performance');

const plant = computed(() => PLANTS[plantId.value]);
const machine = computed(() => plant.value?.machines.find(m => m.id === machineId.value));

const processData = ref<any>(null);
const utilityData = ref<any>(null);
const performanceData = ref<any>(null);
const loading = ref(true);
const isInitialLoad = ref(true);
const error = ref<string | null>(null);

let refreshInterval: number | null = null;
let lastLoggedTab = ref('');

const tabs = [
  { id: 'performance', name: 'PERFORMANCE', icon: TrendingUp },
  { id: 'process', name: 'PROCESS', icon: Activity },
  { id: 'utility', name: 'UTILITY', icon: Zap },
  { id: 'packing', name: 'PACKING', icon: Activity },
  { id: 'alarms', name: 'ALARMS', icon: AlertTriangle },
  { id: 'downtime', name: 'DOWNTIME', icon: AlertTriangle },
  { id: 'maintenance', name: 'MAINTENANCE', icon: Wrench },
];

async function fetchMachineData(logToConsole = false) {
  try {
    if (isInitialLoad.value) {
      loading.value = true;
    }
    error.value = null;
    
    // Only log when explicitly requested (user action) and tab changed
    if (logToConsole && lastLoggedTab.value !== activeTab.value) {
      console.log(`%c📍 ${machine.value?.name} - ${activeTab.value.toUpperCase()}`, 'color: #3b82f6; font-weight: bold; font-size: 14px');
      lastLoggedTab.value = activeTab.value;
    }
    
    const [process, utility, performance] = await Promise.all([
      getMachineProcessData(plantId.value, machineId.value),
      getMachineUtilityData(plantId.value, machineId.value),
      getMachinePerformanceData(plantId.value, machineId.value),
    ]);
    
    processData.value = process;
    utilityData.value = utility;
    performanceData.value = performance;
  } catch (err: any) {
    error.value = err.message || 'Failed to fetch machine data';
    if (logToConsole) {
      console.error('❌ Error:', err.message);
    }
  } finally {
    loading.value = false;
    isInitialLoad.value = false;
  }
}

// Watch for route changes (user navigation)
watch([plantId, machineId, activeTab], () => {
  fetchMachineData(true); // Log on user action
}, { immediate: false });

onMounted(() => {
  fetchMachineData(true); // Log on initial mount
  // Auto-refresh without logging
  refreshInterval = window.setInterval(() => fetchMachineData(false), 3000);
});

onUnmounted(() => {
  if (refreshInterval) {
    clearInterval(refreshInterval);
  }
});

function formatLabel(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}
</script>

<template>
  <div class="machine-detail" v-if="machine">
    <div class="header">
       <div class="icon-box">
          <Cog class="w-8 h-8 text-white" />
       </div>
       <div>
          <h1 class="title">{{ machine.name }}</h1>
          <p class="subtitle">{{ plant.name }} - Production Data Monitoring</p>
       </div>
    </div>

    <!-- Tab Navigation -->
    <div class="tabs">
      <router-link
        v-for="tab in tabs"
        :key="tab.id"
        :to="{
          name: `MachineDetail${tab.id.charAt(0).toUpperCase() + tab.id.slice(1)}`,
          params: { plantId, machineId }
        }"
        v-slot="{ isActive }"
      >
        <button :class="['tab', { active: isActive }]">
          <component :is="tab.icon" class="tab-icon" />
          {{ tab.name }}
        </button>
      </router-link>
    </div>

    <div v-if="loading && isInitialLoad" class="loading-state">
      <div class="skeleton-grid">
        <div class="skeleton-card" v-for="i in 6" :key="i">
          <div class="skeleton-label"></div>
          <div class="skeleton-value"></div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
    </div>

    <!-- Performance Tab (Default) -->
    <div v-if="activeTab === 'performance'" class="tab-content">
      <div class="data-section" v-if="performanceData">
        <div class="section-header">
          <TrendingUp class="w-5 h-5" />
          <h2>Performance Metrics</h2>
        </div>
        <div class="data-cards">
          <template v-for="(value, key) in performanceData" :key="key">
            <div class="data-card" :class="{ 'highlight': key.includes('oee') || key.includes('Efficiency') }" v-if="!key.includes('Unit') && !key.includes('timestamp') && key !== 'targetProduction'">
              <span class="label">{{ formatLabel(key) }}</span>
              <span class="value">{{ value }} {{ performanceData[key + 'Unit'] || '' }}</span>
              <span class="target" v-if="key === 'actualProduction' && performanceData.targetProduction">
                Target: {{ performanceData.targetProduction }} {{ performanceData.targetProductionUnit }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Process Tab -->
    <div v-else-if="activeTab === 'process'" class="tab-content">
      <div class="data-section" v-if="processData">
        <div class="section-header">
          <Activity class="w-5 h-5" />
          <h2>Process Data</h2>
        </div>
        <div class="data-cards">
          <template v-for="(value, key) in processData" :key="key">
            <div class="data-card" v-if="!key.includes('Unit') && !key.includes('timestamp') && !key.includes('Status') && !key.includes('Mode')">
              <span class="label">{{ formatLabel(key) }}</span>
              <span class="value">{{ value }} {{ processData[key + 'Unit'] || '' }}</span>
            </div>
          </template>
          <div class="data-card status-card" v-if="processData.operatingMode">
            <span class="label">Operating Mode</span>
            <span class="value">{{ processData.operatingMode }}</span>
          </div>
          <div class="data-card status-card" v-if="processData.machineStatus">
            <span class="label">Machine Status</span>
            <span class="value" :class="processData.machineStatus === 'RUNNING' ? 'status-on' : 'status-off'">
              {{ processData.machineStatus }}
            </span>
          </div>
          <div class="data-card status-card" v-if="processData.alarmStatus">
            <span class="label">Alarm Status</span>
            <span class="value" :class="processData.alarmStatus === 'NORMAL' ? 'status-on' : 'status-alarm'">
              {{ processData.alarmStatus }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Utility Tab -->
    <div v-else-if="activeTab === 'utility'" class="tab-content">
      <div class="data-section" v-if="utilityData">
        <div class="section-header">
          <Zap class="w-5 h-5" />
          <h2>Utility Consumption</h2>
        </div>
        <div class="data-cards">
          <template v-for="(value, key) in utilityData" :key="key">
            <div class="data-card highlight" v-if="!key.includes('Unit') && !key.includes('timestamp') && !key.includes('Cost')">
              <span class="label">{{ formatLabel(key) }}</span>
              <span class="value">{{ value }} {{ utilityData[key + 'Unit'] || '' }}</span>
              <span class="cost" v-if="utilityData[key + 'Cost']">
                Cost: {{ utilityData[key + 'Cost'] }} {{ utilityData[key + 'CostUnit'] }}
              </span>
            </div>
          </template>
        </div>
      </div>
    </div>

    <!-- Packing Tab -->
    <div v-else-if="activeTab === 'packing'" class="tab-content">
      <div class="data-section">
        <div class="section-header">
          <Activity class="w-5 h-5" />
          <h2>Packing Data</h2>
        </div>
        <div class="empty-state">
          <p>Packing data integration coming soon...</p>
        </div>
      </div>
    </div>

    <!-- Alarms Tab -->
    <div v-else-if="activeTab === 'alarms'" class="tab-content">
      <div class="data-section">
        <div class="section-header">
          <AlertTriangle class="w-5 h-5" />
          <h2>Alarms & Alerts</h2>
        </div>
        <div class="empty-state">
          <p>Alarm system integration coming soon...</p>
        </div>
      </div>
    </div>

    <!-- Downtime Tab -->
    <div v-else-if="activeTab === 'downtime'" class="tab-content">
      <div class="data-section">
        <div class="section-header">
          <AlertTriangle class="w-5 h-5" />
          <h2>Downtime Analysis</h2>
        </div>
        <div class="empty-state">
          <p>Downtime tracking integration coming soon...</p>
        </div>
      </div>
    </div>

    <!-- Maintenance Tab -->
    <div v-else-if="activeTab === 'maintenance'" class="tab-content">
      <div class="data-section">
        <div class="section-header">
          <Wrench class="w-5 h-5" />
          <h2>Maintenance Schedule</h2>
        </div>
        <div class="empty-state">
          <p>Maintenance tracking integration coming soon...</p>
        </div>
      </div>
    </div>
  </div>
  <div v-else class="error">
     Machine not found
  </div>
</template>

<style scoped>
.machine-detail {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
}

.icon-box {
  width: 4rem;
  height: 4rem;
  background: #3b82f6;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  color: #94a3b8;
  margin-top: 0.25rem;
}

.tabs {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 2rem;
  background: #0f172a;
  padding: 0.5rem;
  border-radius: 0.75rem;
  border: 1px solid #334155;
  overflow-x: auto;
}

.tab {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: none;
  color: #94a3b8;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
}

.tab:hover {
  background: #1e293b;
  color: #e2e8f0;
}

.tab.active {
  background: #3b82f6;
  color: white;
}

.tab-icon {
  width: 1.25rem;
  height: 1.25rem;
}

.tab-content {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.loading-state, .error-state {
  text-align: center;
  padding: 2rem;
  background: #1e293b;
  border-radius: 1rem;
  color: #94a3b8;
  border: 1px solid #334155;
}

.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.skeleton-card {
  background: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.skeleton-label {
  height: 14px;
  width: 60%;
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 4px;
}

.skeleton-value {
  height: 28px;
  width: 80%;
  background: linear-gradient(90deg, #334155 25%, #475569 50%, #334155 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  border-radius: 6px;
}

@keyframes shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

.error-state {
  color: #ef4444;
}

.data-section {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  border: 1px solid #334155;
}

.section-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  color: #3b82f6;
}

.section-header h2 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.data-cards {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.data-card {
  background: #0f172a;
  padding: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #334155;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.data-card.highlight {
  border-color: #3b82f6;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
}

.data-card.status-card {
  border-color: #6366f1;
}

.data-card .label {
  font-size: 0.875rem;
  color: #94a3b8;
  font-weight: 500;
}

.data-card .value {
  font-size: 1.25rem;
  color: white;
  font-weight: 700;
}

.data-card .cost,
.data-card .target {
  font-size: 0.75rem;
  color: #64748b;
  margin-top: 0.25rem;
}

.status-on {
  color: #10b981 !important;
}

.status-off {
  color: #6b7280 !important;
}

.status-alarm {
  color: #ef4444 !important;
}

.empty-state {
  text-align: center;
  padding: 3rem;
  color: #64748b;
}

.error {
  text-align: center;
  padding: 4rem;
  color: #ef4444;
}
</style>
