<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { 
    Factory, 
    Activity, 
    Zap, 
    AlertTriangle, 
    TrendingUp, 
    Cloud, 
    Droplet, 
    Wind, 
    Box, 
    Flame,
    ArrowLeft
} from 'lucide-vue-next';
import { getLvmdpTrend, getLvmdpShiftToday } from '@/lib/api';

const route = useRoute();
const router = useRouter();

const plantId = route.params.plantId as string;
const plantConfig = PLANTS[plantId as keyof typeof PLANTS] || PLANTS['cikupa'];

// --- Types & Constants ---
type Period = 'Day' | 'Week' | 'Month' | 'Year';
const PERIODS: Period[] = ['Day', 'Week', 'Month', 'Year'];

// --- State ---
const selectedPeriod = ref<Period>('Day');
const isLoading = ref(false);
const totalEnergy = ref(0); // Real data for Cikupa
const totalElectricity = ref(7147); // Will update with real data

// Dummy Data
const output = ref(15600);
const oee = ref(84.73);
const alarms = ref(2);

// Utility Data (Dummy except Electricity)
const utilities = ref([
    { id: 'electricity', label: 'Electricity', val: '7,147', unit: 'kWh', icon: Zap, route: 'energy/electricity' },
    { id: 'steam', label: 'Steam', val: '21,11', unit: 'Ton', icon: Cloud, route: 'energy/steam' },
    { id: 'water', label: 'Water', val: '492,8', unit: 'm³', icon: Droplet, route: 'energy/water' },
    { id: 'compressed-air', label: 'Compressed Air', val: '21.289,2', unit: 'Nm³', icon: Wind, route: 'energy/compressed-air' },
    { id: 'nitrogen', label: 'Nitrogen', val: '554,27', unit: 'Nm³', icon: Box, route: 'energy/nitrogen' },
    { id: 'gas', label: 'Natural Gas', val: '1.504,94', unit: 'Nm³', icon: Flame, route: 'energy/gas' }
]);

// Shift Dummy
const shifts = ref([
    { name: 'Shift 1', time: '07:01 - 14:30', output: '9.360', oee: '86,7%', status: 'COMPLETED' },
    { name: 'Shift 2', time: '14:31 - 22:00', output: '6.240', oee: '85%', status: 'ACTIVE' },
    { name: 'Shift 3', time: '22:01 - 07:00', output: '0', oee: '0%', status: 'UPCOMING' }
]);

// Machines (Production Lines) - Cikupa specific
const machines = ref([
    { name: 'PC39', output: '3.075', oee: '89,32%', status: 'RUNNING' },
    { name: 'PC14', output: '2.640', oee: '83,49%', status: 'RUNNING' },
    { name: 'Tortilla', output: '5.400', oee: '91,45%', status: 'RUNNING' },
    { name: 'TWS 5.6', output: '6.690', oee: '91,27%', status: 'RUNNING' },
    { name: 'FCP', output: '3.495', oee: '72,13%', status: 'RUNNING' },
    { name: 'TWS 7.2', output: '4.665', oee: '74,07%', status: 'RUNNING' },
    { name: 'Cassava Copack', output: '7.815', oee: '88,64%', status: 'RUNNING' },
    { name: 'Cassava Inhouse', output: '615', oee: '84,79%', status: 'BREAKDOWN' },
    { name: 'Packing Pouch', output: '4.110', oee: '78,2%', status: 'RUNNING', warning: 'Maintenance Required' },
    { name: 'Vacuum Fryer 1', output: '12.090', oee: '90,96%', status: 'RUNNING' }
]);

// Active Alarms Dummy
const activeAlarms = ref([
    { title: 'Overcurrent Phase R', time: '11:15:00 • LVMDP-1 Cikupa', type: 'WARNING' },
    { title: 'Sealer Temp Low', time: '11:00:00 • Packing Pouch Cikupa', type: 'WARNING' }
]);

// --- Methods ---

function goBack() {
    router.push('/global');
}

function navigateTo(path: string) {
    router.push(`/plant/${plantId}/${path}`);
}

function navigateToMachine(machineName: string) {
    // Basic slugify
    const slug = machineName.toLowerCase().replace(/\s+/g, '-').replace('.', '-');
    router.push(`/plant/${plantId}/production/machine/${slug}`);
}

const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

async function fetchEnergyData() {
    if (plantId !== 'cikupa') return; // Only real for Cikupa for now
    
    isLoading.value = true;
    totalEnergy.value = 0;
    
    try {
        let total = 0;
        const now = new Date();
        const todayStr = now.toISOString().split('T')[0];

        // Fetch LVMDP 1-4
        for (let i = 1; i <= 4; i++) {
            let panelsTotal = 0;

            if (selectedPeriod.value === 'Day') {
                 try {
                     const shiftData = await getLvmdpShiftToday(i as 1|2|3|4);
                     if (shiftData) {
                         panelsTotal += (shiftData.shift1?.totalKwh || 0);
                         panelsTotal += (shiftData.shift2?.totalKwh || 0);
                         panelsTotal += (shiftData.shift3?.totalKwh || 0);
                     }
                 } catch (err) { console.warn(`Failed fetch LVMDP ${i} shifts`, err); }
            } else {
                const periodKey = selectedPeriod.value.toLowerCase() as 'week' | 'month' | 'year';
                try {
                    const res = await getLvmdpTrend(i as 1|2|3|4, periodKey, todayStr);
                    if (res && res.data) {
                        panelsTotal = res.data.reduce((a, b) => a + b, 0);
                    }
                } catch (err) { console.warn(`Failed fetch LVMDP ${i} trend`, err); }
            }
            total += panelsTotal;
        }
        totalEnergy.value = total;
        
        // Update Electricity Utility Card
        const elec = utilities.value.find(u => u.id === 'electricity');
        if (elec) {
            elec.val = formatNumber(total);
        }

    } catch (e) { 
        console.error("Error fetching energy", e); 
    } finally { 
        isLoading.value = false; 
    }
}

watch(selectedPeriod, () => {
    fetchEnergyData();
}, { immediate: true });

onMounted(() => {
    // If not Cikupa, maybe load dummy/other logic
});

</script>

<template>
  <div class="dashboard-container">
    <!-- Header -->
    <div class="header-section">
        <div class="flex items-center gap-4">
            <button @click="goBack" class="back-btn">
                <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
                <h1 class="title">Plant {{ plantConfig.name }}</h1>
                <p class="subtitle">{{ plantConfig.location }}</p>
            </div>
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

    <!-- Plant At A Glance -->
    <div class="section-container">
        <h2 class="section-title">Plant At a Glance</h2>
        <div class="metrics-grid">
             <!-- Output -->
            <div class="metric-card">
                <div class="mc-content">
                    <span class="mc-label">OUTPUT ({{ selectedPeriod.toUpperCase() }})</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ formatNumber(output) }}</span>
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
                    <span class="mc-label">OEE</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ formatNumber(oee, 2) }}</span>
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
                    <span class="mc-label">ENERGY ({{ selectedPeriod.toUpperCase() }})</span>
                    <div class="mc-val-row">
                         <span v-if="isLoading && plantId === 'cikupa'" class="mc-value text-sm">Loading...</span>
                        <span v-else class="mc-value">{{ formatNumber(totalEnergy) }}</span>
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
                    <span class="mc-label">TOTAL ALARMS</span>
                    <div class="mc-val-row">
                        <span class="mc-value">{{ alarms }}</span>
                    </div>
                </div>
                <div class="mc-icon red">
                    <AlertTriangle class="w-5 h-5" />
                </div>
            </div>
        </div>
    </div>

    <!-- Utility Consumption -->
    <div class="section-container">
        <h2 class="section-title">Utility Consumption ({{ selectedPeriod }})</h2>
        <div class="utility-grid">
            <div 
                v-for="u in utilities" 
                :key="u.id" 
                class="util-card"
                @click="navigateTo(u.route)"
            >
                <div class="util-icon">
                    <component :is="u.icon" class="w-5 h-5" />
                </div>
                <div class="util-info">
                    <span class="u-label">{{ u.label }}</span>
                    <span class="u-val">{{ u.val }} <small>{{ u.unit }}</small></span>
                </div>
            </div>
        </div>
    </div>

    <!-- Middle Section: Shift Performance & Active Alarms -->
    <div class="mid-grid">
        <!-- Shift Performance -->
        <div class="panel-card">
            <h2 class="panel-title">Shift Performance</h2>
            <div class="shift-table">
                <div class="st-head">
                    <span>SHIFT</span>
                    <span>TIME</span>
                    <span>OUTPUT (KG)</span>
                    <span>OEE</span>
                    <span>STATUS</span>
                </div>
                <div v-for="s in shifts" :key="s.name" class="st-row" :class="{ 'active-row': s.status === 'ACTIVE' }">
                    <span class="font-bold">{{ s.name }}</span>
                    <span class="text-gray-400">{{ s.time }}</span>
                    <span class="font-bold">{{ s.output }}</span>
                    <span :class="{'text-green': s.oee !== '0%', 'text-red': s.oee === '0%'}">{{ s.oee }}</span>
                    <span>
                        <span class="status-badge" :class="s.status.toLowerCase()">{{ s.status }}</span>
                    </span>
                </div>
            </div>
        </div>

        <!-- Active Alarms -->
        <div class="panel-card">
            <h2 class="panel-title">Active Alarms</h2>
            <div class="alarm-list">
                <div v-for="(a, idx) in activeAlarms" :key="idx" class="alarm-item">
                    <div class="ai-icon">
                        <AlertTriangle class="w-4 h-4 text-orange-500" />
                    </div>
                    <div>
                        <div class="ai-title">{{ a.title }}</div>
                        <div class="ai-time">{{ a.time }}</div>
                    </div>
                    <span class="ai-badge">{{ a.type }}</span>
                </div>
            </div>
        </div>
    </div>

    <!-- Production Lines -->
    <div class="section-container mt-6">
         <div class="header-row">
            <Activity class="w-5 h-5 text-gray-400" />
            <h2 class="section-title mb-0">Production Lines</h2>
        </div>
        <div class="lines-grid">
            <div 
                v-for="m in machines" 
                :key="m.name" 
                class="line-card"
                @click="navigateToMachine(m.name)"
            >
                <div class="lc-header">
                    <h3 class="lc-name">{{ m.name }}</h3>
                    <span class="status-badge" :class="m.status === 'RUNNING' ? 'running' : 'breakdown'">{{ m.status }}</span>
                </div>
                <div v-if="m.warning" class="lc-warning">
                    • {{ m.warning }}
                </div>
                <div class="lc-stats">
                    <div class="lc-stat">
                        <span class="label">OUTPUT</span>
                        <span class="val">{{ m.output }} <small>kg</small></span>
                    </div>
                    <div class="lc-stat text-right">
                        <span class="label">OEE</span>
                        <span class="val" :class="m.status === 'RUNNING' ? 'text-green' : 'text-gray-400'">{{ m.oee }}</span>
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

.back-btn {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    padding: 0.5rem;
    border-radius: 50%;
    transition: all 0.2s;
}
.back-btn:hover { background: rgba(255,255,255,0.1); color: white; }

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
.filter-btn:hover { color: white; }
.filter-btn.active { background: #2563eb; color: white; }

/* Section */
.section-container { margin-bottom: 2rem; }
.section-title { font-size: 1rem; color: #cbd5e1; margin-bottom: 1rem; font-weight: 600; }
.header-row { display: flex; align-items: center; gap: 0.75rem; margin-bottom: 1rem; }

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 1rem;
}

.metric-card {
    background: #1e293b;
    border-radius: 12px;
    padding: 1.5rem;
    display: flex;
    justify-content: space-between;
    border: 1px solid #334155;
}

.mc-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; display: block; margin-bottom: 0.5rem; }
.mc-val-row { display: flex; align-items: baseline; gap: 0.5rem; }
.mc-value { font-size: 1.75rem; font-weight: 700; color: white; }
.mc-unit { font-size: 0.9rem; color: #94a3b8; }
.mc-icon { background: rgba(255,255,255,0.05); padding: 0.75rem; border-radius: 10px; color: #94a3b8; height: fit-content; }
.mc-icon.green { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
.mc-icon.yellow { color: #facc15; background: rgba(250, 204, 21, 0.1); }
.mc-icon.red { color: #f87171; background: rgba(248, 113, 113, 0.1); }

/* Utility Grid */
.utility-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
    gap: 1rem;
}

.util-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 1rem;
    display: flex;
    align-items: center;
    gap: 1rem;
    cursor: pointer;
    transition: all 0.2s;
}
.util-card:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.util-icon { color: #facc15; }
.util-info { display: flex; flex-direction: column; }
.u-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; }
.u-val { font-size: 1rem; font-weight: 700; color: white; }
.u-val small { font-size: 0.7rem; color: #64748b; font-weight: 500; }

/* Mid Grid */
.mid-grid {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: 1.5rem;
}
@media(max-width: 1024px) { .mid-grid { grid-template-columns: 1fr; } }

.panel-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 12px;
    padding: 1.5rem;
}

.panel-title { font-size: 1rem; font-weight: 600; color: #cbd5e1; margin-bottom: 1rem; }

/* Shift Table */
.shift-table { display: flex; flex-direction: column; gap: 0.5rem; }
.st-head { display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr; padding: 0.5rem 1rem; font-size: 0.7rem; font-weight: 600; color: #64748b; text-transform: uppercase; }
.st-row { 
    display: grid; grid-template-columns: 1fr 1.5fr 1fr 1fr 1fr; 
    padding: 1rem; background: #0f172a; border-radius: 8px; border: 1px solid #1e293b;
    align-items: center; font-size: 0.85rem; color: white;
}
.st-row.active-row { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }

.status-badge { font-size: 0.65rem; padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; width: fit-content; }
.status-badge.completed { background: #334155; color: #94a3b8; }
.status-badge.active { background: #2563eb; color: white; }
.status-badge.upcoming { background: transparent; color: #64748b; border: 1px solid #334155; }
.status-badge.running { background: rgba(34, 197, 94, 0.15); color: #4ade80; border: 1px solid rgba(34, 197, 94, 0.2); }
.status-badge.breakdown { background: rgba(248, 113, 113, 0.15); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.2); }

/* Alarms */
.alarm-list { display: flex; flex-direction: column; gap: 0.75rem; }
.alarm-item {
    background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem;
    display: flex; align-items: center; gap: 1rem;
}
.ai-icon { background: rgba(251, 146, 60, 0.1); padding: 0.5rem; border-radius: 6px; }
.ai-title { font-weight: 600; color: #e2e8f0; font-size: 0.9rem; }
.ai-time { font-size: 0.75rem; color: #94a3b8; margin-top: 0.1rem; }
.ai-badge { margin-left: auto; font-size: 0.65rem; color: #fb923c; background: rgba(251, 146, 60, 0.1); padding: 0.25rem 0.5rem; border-radius: 4px; border: 1px solid #fb923c; font-weight: 700; }

/* Lines Grid */
.lines-grid {
    display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem;
}
.line-card {
    background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.25rem;
    cursor: pointer; transition: all 0.2s;
}
.line-card:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
.lc-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; }
.lc-name { font-weight: 700; color: white; font-size: 1rem; }
.lc-warning { font-size: 0.7rem; color: #f87171; margin-bottom: 0.5rem; font-weight: 600; }
.lc-stats { display: flex; justify-content: space-between; margin-top: 1rem; }
.lc-stat { display: flex; flex-direction: column; }
.lc-stat .label { font-size: 0.65rem; color: #64748b; font-weight: 600; margin-bottom: 0.2rem; }
.lc-stat .val { font-size: 1.1rem; font-weight: 700; color: white; }
.lc-stat .val small { font-size: 0.75rem; color: #94a3b8; font-weight: 500; }
.text-green { color: #4ade80; }
.text-red { color: #f87171; }
.text-orange { color: #fb923c; }

</style>
