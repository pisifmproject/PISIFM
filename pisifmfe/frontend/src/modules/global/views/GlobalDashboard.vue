<script setup lang="ts">
import { computed, ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { Factory, Activity, Zap, AlertTriangle, TrendingUp } from 'lucide-vue-next';
import { getLvmdpTrend, getLvmdpShiftToday } from '@/lib/api';

const router = useRouter();

// --- Types & Constants ---
type Period = 'Day' | 'Week' | 'Month' | 'Year';

const PERIODS: Period[] = ['Day', 'Week', 'Month', 'Year'];

// --- State ---
const selectedPeriod = ref<Period>('Day');
const cikupaEnergy = ref(0);
const isLoading = ref(false);
const selectedPlantId = ref<string | null>(null);

const plantData = ref({
    cikupa: { output: 15600, oee: 84.95, alarms: 2, status: 'WARNING' },
    cikokol: { output: 12500, oee: 81.35, energy: 3200, alarms: 3, status: 'WARNING' },
    semarang: { output: 18200, oee: 77.33, energy: 4100, alarms: 2, status: 'WARNING' },
    agro: { output: 0, oee: 69.33, energy: 500, alarms: 0, status: 'NORMAL' }
});

// --- Computed ---
const globalStats = computed(() => {
    const output = plantData.value.cikupa.output + plantData.value.cikokol.output + plantData.value.semarang.output + plantData.value.agro.output;
    const energy = cikupaEnergy.value + plantData.value.cikokol.energy + plantData.value.semarang.energy + plantData.value.agro.energy;
    const oee = (plantData.value.cikupa.oee + plantData.value.cikokol.oee + plantData.value.semarang.oee + plantData.value.agro.oee) / 4;
    const alarms = plantData.value.cikupa.alarms + plantData.value.cikokol.alarms + plantData.value.semarang.alarms + plantData.value.agro.alarms;
    return { output, energy, oee, alarms };
});

function handlePlantClick(plantId: string) {
    if (selectedPlantId.value === plantId) {
        router.push(`/plant/${plantId}`);
    } else {
        selectedPlantId.value = plantId;
    }
}

const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

async function fetchCikupaEnergy() {
    isLoading.value = true;
    cikupaEnergy.value = 0;
    
    try {
        let total = 0;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        for (let i = 1; i <= 4; i++) {
            let panelsTotal = 0;

            if (selectedPeriod.value === 'Day') {
                 // For Day: Use Shift Data (Production Day)
                 try {
                     const shiftData = await getLvmdpShiftToday(i as 1|2|3|4);
                     if (shiftData) {
                         panelsTotal += (shiftData.shift1?.totalKwh || 0);
                         panelsTotal += (shiftData.shift2?.totalKwh || 0);
                         panelsTotal += (shiftData.shift3?.totalKwh || 0);
                     }
                 } catch (err) { 
                     console.warn(`Failed fetch LVMDP ${i} shifts`, err);
                     // Fallback to hourly trend if needed
                 }
            } else {
                // For Week, Month, Year: Use Trend Data directly (DB Aggregation)
                const periodKey = selectedPeriod.value.toLowerCase() as 'week' | 'month' | 'year';
                try {
                    const res = await getLvmdpTrend(i as 1|2|3|4, periodKey, todayStr);
                    if (res && res.data) {
                        panelsTotal = res.data.reduce((a, b) => a + b, 0);
                    }
                } catch (err) {
                    console.warn(`Failed fetch LVMDP ${i} trend`, err);
                }
            }
            total += panelsTotal;
        }
        cikupaEnergy.value = total;
    } catch (e) { 
        console.error("Error fetching energy", e); 
    } finally { 
        isLoading.value = false; 
    }
}

watch(selectedPeriod, () => {
    fetchCikupaEnergy();
}, { immediate: true });

</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header-section">
        <div>
            <h1 class="title">Corporate Overview</h1>
            <p class="subtitle">Multi-Plant Performance Monitor</p>
        </div>
        <div class="time-filters">
            <button 
                v-for="p in PERIODS" 
                :key="p"
                class="filter-btn"
                :class="{ active: selectedPeriod === p }"
                @click="selectedPeriod = p"
            >
                {{ p.toUpperCase() }}
            </button>
        </div>
    </div>

    <!-- Global Performance -->
    <div class="section-container">
        <h2 class="section-title">Global Performance At a Glance</h2>
        <div class="metrics-grid">
            <!-- Output -->
            <div class="metric-card">
                <div class="mc-content">
                    <span class="mc-label">TOTAL OUTPUT ({{ selectedPeriod.toUpperCase() }})</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ formatNumber(globalStats.output * (selectedPeriod === 'Day' ? 1 : selectedPeriod === 'Week' ? 7 : 30)) }}</span>
                        <span class="mc-unit">kg</span>
                    </div>
                </div>
                <div class="mc-icon">
                    <Factory class="w-5 h-5" />
                </div>
            </div>

            <!-- OEE -->
             <div class="metric-card">
                <div class="mc-content">
                    <span class="mc-label">GLOBAL AVG OEE</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ formatNumber(globalStats.oee, 2) }}</span>
                        <span class="mc-unit">%</span>
                    </div>
                </div>
                <div class="mc-icon green">
                    <TrendingUp class="w-5 h-5" />
                </div>
            </div>

            <!-- Energy -->
             <div class="metric-card">
                <div class="mc-content">
                    <span class="mc-label">TOTAL ENERGY ({{ selectedPeriod.toUpperCase() }})</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ formatNumber(globalStats.energy) }}</span>
                        <span class="mc-unit">kWh</span>
                    </div>
                </div>
                <div class="mc-icon yellow">
                    <Zap class="w-5 h-5" />
                </div>
            </div>

            <!-- Alarms -->
             <div class="metric-card">
                <div class="mc-content">
                    <span class="mc-label">ACTIVE ALARMS</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ globalStats.alarms }}</span>
                    </div>
                </div>
                <div class="mc-icon red">
                    <AlertTriangle class="w-5 h-5" />
                </div>
            </div>
        </div>
    </div>

    <!-- Plant Status Overview -->
    <div class="section-container">
        <div class="header-row">
            <Factory class="w-5 h-5 text-gray-400" />
            <h2 class="section-title mb-0">Plant Status Overview</h2>
        </div>
        
        <div class="plants-grid">
            <!-- Plant Cikokol (Dummy) -->
            <div 
                class="plant-card" 
                :class="{ 'active-plant': selectedPlantId === 'cikokol' }"
                @click="handlePlantClick('cikokol')"
            >
                <div class="pc-header">
                    <div>
                        <h3 class="pc-name">Plant Cikokol</h3>
                        <span class="pc-loc">TANGERANG</span>
                    </div>
                    <span class="pc-badge warning">WARNING</span>
                </div>
                <div class="pc-stats">
                    <div class="pc-stat-col">
                        <span class="label">OUTPUT</span>
                        <span class="val">{{ formatNumber(plantData.cikokol.output) }} <small>kg</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                        <span class="label">OEE</span>
                        <span class="val text-orange">{{ formatNumber(plantData.cikokol.oee, 2) }}%</span>
                    </div>
                </div>
                <div class="pc-stats mt-4">
                    <div class="pc-stat-col">
                         <span class="label">ENERGY</span>
                        <span class="val text-yellow">{{ formatNumber(plantData.cikokol.energy) }} <small>kWh</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                         <span class="label">ALARMS</span>
                         <span class="val text-red">{{ plantData.cikokol.alarms }} Active</span>
                    </div>
                </div>
            </div>

            <!-- Plant Semarang (Dummy) -->
             <div 
                class="plant-card"
                :class="{ 'active-plant': selectedPlantId === 'semarang' }"
                @click="handlePlantClick('semarang')"
            >
                <div class="pc-header">
                    <div>
                        <h3 class="pc-name">Plant Semarang</h3>
                        <span class="pc-loc">CENTRAL JAVA</span>
                    </div>
                    <span class="pc-badge warning">WARNING</span>
                </div>
                <div class="pc-stats">
                    <div class="pc-stat-col">
                        <span class="label">OUTPUT</span>
                        <span class="val">{{ formatNumber(plantData.semarang.output) }} <small>kg</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                        <span class="label">OEE</span>
                        <span class="val text-orange">{{ formatNumber(plantData.semarang.oee, 2) }}%</span>
                    </div>
                </div>
                <div class="pc-stats mt-4">
                    <div class="pc-stat-col">
                         <span class="label">ENERGY</span>
                        <span class="val text-yellow">{{ formatNumber(plantData.semarang.energy) }} <small>kWh</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                         <span class="label">ALARMS</span>
                         <span class="val text-red">{{ plantData.semarang.alarms }} Active</span>
                    </div>
                </div>
            </div>

            <!-- Plant Cikupa (Real Energy) -->
            <div 
                class="plant-card" 
                :class="{ 'active-plant': selectedPlantId === 'cikupa' }"
                @click="handlePlantClick('cikupa')"
            >
                <div class="pc-glow" v-if="selectedPlantId === 'cikupa'"></div>
                <div class="pc-header">
                    <div>
                        <h3 class="pc-name text-blue-400">Plant Cikupa</h3>
                        <span class="pc-loc">TANGERANG</span>
                    </div>
                    <span class="pc-badge warning">WARNING</span>
                </div>
                <div class="pc-stats">
                    <div class="pc-stat-col">
                        <span class="label">OUTPUT</span>
                        <span class="val">{{ formatNumber(plantData.cikupa.output) }} <small>kg</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                        <span class="label">OEE</span>
                        <span class="val text-green">{{ formatNumber(plantData.cikupa.oee, 2) }}%</span>
                    </div>
                </div>
                <div class="pc-stats mt-4">
                    <div class="pc-stat-col">
                         <span class="label">ENERGY</span>
                         <span v-if="isLoading" class="val text-yellow text-sm">Loading...</span>
                        <span v-else class="val text-yellow">{{ formatNumber(cikupaEnergy) }} <small>kWh</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                         <span class="label">ALARMS</span>
                         <span class="val text-red">{{ plantData.cikupa.alarms }} Active</span>
                    </div>
                </div>
            </div>

            <!-- Plant Agro (Dummy) -->
            <div 
                class="plant-card" 
                :class="{ 'active-plant': selectedPlantId === 'agro' }"
                @click="handlePlantClick('agro')"
            >
                <div class="pc-header">
                    <div>
                        <h3 class="pc-name">Plant Agro</h3>
                        <span class="pc-loc">DEVELOPMENT</span>
                    </div>
                    <span class="pc-badge normal">NORMAL</span>
                </div>
                <div class="pc-stats">
                    <div class="pc-stat-col">
                        <span class="label">OUTPUT</span>
                        <span class="val">{{ formatNumber(plantData.agro.output) }} <small>kg</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                        <span class="label">OEE</span>
                        <span class="val text-green">{{ formatNumber(plantData.agro.oee, 2) }}%</span>
                    </div>
                </div>
                <div class="pc-stats mt-4">
                    <div class="pc-stat-col">
                         <span class="label">ENERGY</span>
                        <span class="val text-yellow">{{ formatNumber(plantData.agro.energy) }} <small>kWh</small></span>
                    </div>
                    <div class="pc-stat-col text-right">
                         <span class="label">ALARMS</span>
                         <span class="val text-gray-400">0 Active</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
  padding: 1rem;
}

/* Header */
.header-section {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}

.title {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.2rem;
}

.subtitle {
    color: #94a3b8;
    font-size: 0.9rem;
}

.time-filters {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 8px;
    padding: 0.25rem;
    display: flex;
    gap: 0.25rem;
}

.filter-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 0.5rem 1rem;
    border-radius: 6px;
    font-size: 0.75rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
}

.filter-btn:hover {
    color: white;
}

.filter-btn.active {
    background: #2563eb;
    color: white;
}

/* Section */
.section-container {
    margin-bottom: 2.5rem;
}

.section-title {
    font-size: 1rem;
    color: #cbd5e1;
    margin-bottom: 1rem;
    font-weight: 600;
}

.header-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1rem;
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1.5rem;
}

.metric-card {
    background: #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    border: 1px solid #334155;
    position: relative;
    overflow: hidden;
}

.mc-content {
    display: flex;
    flex-direction: column;
    z-index: 1;
}

.mc-label {
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 0.5rem;
    text-transform: uppercase;
}

.mc-val-row {
    display: flex;
    align-items: baseline;
    gap: 0.5rem;
    margin-bottom: 0.25rem;
}

.mc-value {
    font-size: 1.75rem;
    font-weight: 700;
    color: white;
}

.mc-unit {
    font-size: 0.9rem;
    color: #94a3b8;
    font-weight: 500;
}

.mc-trend {
    font-size: 0.75rem;
    font-weight: 500;
}
.mc-trend.positive { color: #4ade80; }
.mc-trend.negative { color: #f87171; }

.mc-icon {
    background: rgba(255, 255, 255, 0.05);
    padding: 0.75rem;
    border-radius: 10px;
    color: #94a3b8;
}

.mc-icon.green { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
.mc-icon.yellow { color: #facc15; background: rgba(250, 204, 21, 0.1); }
.mc-icon.red { color: #f87171; background: rgba(248, 113, 113, 0.1); }


/* Plants Grid */
.plants-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.5rem;
}

@media (max-width: 1280px) {
    .plants-grid { grid-template-columns: repeat(2, 1fr); }
}

.plant-card {
    background: #0f172a;
    border: 1px solid #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
    cursor: pointer;
    transition: all 0.2s;
    position: relative;
    min-height: 220px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

.plant-card:hover {
    transform: translateY(-2px);
    border-color: #334155;
    background: #1e293b;
}

.plant-card.active-plant {
    border-color: #3b82f6;
    background: rgba(59, 130, 246, 0.1);
}

.pc-glow {
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background: radial-gradient(circle at top right, rgba(59,130,246,0.1), transparent 70%);
    pointer-events: none;
}

.pc-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 1.5rem;
}

.pc-name {
    font-size: 1rem;
    font-weight: 700;
    color: white;
    margin-bottom: 0.25rem;
}

.pc-loc {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 600;
}

.pc-badge {
    font-size: 0.65rem;
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    font-weight: 700;
    letter-spacing: 0.5px;
}

.pc-badge.warning {
    background: rgba(251, 146, 60, 0.15);
    color: #fb923c;
    border: 1px solid rgba(251, 146, 60, 0.2);
}

.pc-badge.normal {
    background: rgba(34, 197, 94, 0.15);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.2);
}

.pc-stats {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
}

.pc-stat-col {
    display: flex;
    flex-direction: column;
}

.pc-stat-col.text-right {
    text-align: right;
    align-items: flex-end;
}

.pc-stat-col .label {
    font-size: 0.65rem;
    color: #64748b;
    margin-bottom: 0.25rem;
    font-weight: 600;
}

.pc-stat-col .val {
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
}

.pc-stat-col .val small {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 500;
}

.text-green { color: #4ade80 !important; }
.text-yellow { color: #facc15 !important; }
.text-orange { color: #fb923c !important; }
.text-red { color: #f87171 !important; }
.text-blue-400 { color: #60a5fa !important; }
</style>
