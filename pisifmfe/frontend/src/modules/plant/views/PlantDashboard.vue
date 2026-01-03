<script setup lang="ts">
import { ref, computed, onMounted, watch, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { useVisibility } from '@/composables/useVisibility';
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

const plantId = computed(() => route.params.plantId as string);
const plantConfig = computed(() => PLANTS[plantId.value as keyof typeof PLANTS] || PLANTS['cikupa']);

// Visibility composable
const { isVisible, visibilityVersion } = useVisibility();

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

const shifts = ref([
    { name: 'Shift 1', time: '07:01 - 14:30', output: '9.360', oee: '86,7%', status: 'UPCOMING' },
    { name: 'Shift 2', time: '14:31 - 22:00', output: '6.240', oee: '85%', status: 'UPCOMING' },
    { name: 'Shift 3', time: '22:01 - 07:00', output: '0', oee: '0%', status: 'UPCOMING' }
]);

function updateShiftStatus() {
    const now = new Date();
    const minutes = now.getHours() * 60 + now.getMinutes();
    
    // Time ranges in minutes
    // Shift 1: 07:01 (421) - 14:30 (870)
    // Shift 2: 14:31 (871) - 22:00 (1320)
    // Shift 3: 22:01 (1321) - 07:00 (420 next day)

    const s1Start = 421;
    const s1End = 870;
    const s2Start = 871;
    const s2End = 1320;
    
    // Determine active shift and update statuses
    // Default all to UPCOMING first, then override
    let s1Status = 'UPCOMING';
    let s2Status = 'UPCOMING';
    let s3Status = 'UPCOMING';

    // Logic for Production Day (Starts 07:00)
    // If time is between 00:00 and 07:00, we are in Shift 3 of the "previous" day, 
    // implying Shift 1 and 2 of that "day" are completed.
    
    if (minutes >= s1Start && minutes <= s1End) {
        // Shift 1 Active
        s1Status = 'ACTIVE';
        s2Status = 'UPCOMING';
        s3Status = 'UPCOMING';
    } else if (minutes >= s2Start && minutes <= s2End) {
        // Shift 2 Active
        s1Status = 'COMPLETED';
        s2Status = 'ACTIVE';
        s3Status = 'UPCOMING';
    } else {
        // Shift 3 Active (active from 22:01 to 23:59 AND 00:00 to 07:00)
        s1Status = 'COMPLETED';
        s2Status = 'COMPLETED';
        s3Status = 'ACTIVE';
    }

    // Update Shift 1
    shifts.value[0].status = s1Status;
    if (s1Status === 'UPCOMING') {
        shifts.value[0].output = '0';
        shifts.value[0].oee = '0%';
    } else {
        // If not upcoming (Active/Completed), ensure it has dummy data if it was 0
        if (shifts.value[0].output === '0') {
             shifts.value[0].output = '9.360';
             shifts.value[0].oee = '86,7%';
        }
    }

    // Update Shift 2
    shifts.value[1].status = s2Status;
    if (s2Status === 'UPCOMING') {
        shifts.value[1].output = '0';
        shifts.value[1].oee = '0%';
    } else {
         if (shifts.value[1].output === '0') {
             shifts.value[1].output = '6.240';
             shifts.value[1].oee = '85%';
        }
    }

    // Update Shift 3
    shifts.value[2].status = s3Status;
    if (s3Status === 'UPCOMING') {
        shifts.value[2].output = '0';
        shifts.value[2].oee = '0%';
    } else {
         if (shifts.value[2].output === '0') {
             // Give it some dummy data if active/completed
             shifts.value[2].output = '5.120'; 
             shifts.value[2].oee = '82%';
        }
    }
}

// Helper to generate consistent dummy stats based on string hash or just random
function getDummyStats(id: string) {
    // Simple pseudo-random based on id length to keep it consistent-ish during re-renders if needed
    const isRunning = id.length % 5 !== 0; 
    return {
        output: isRunning ? (Math.random() * 5000 + 2000).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ".") : '0',
        oee: isRunning ? (Math.random() * 15 + 75).toFixed(2).replace('.', ',') + '%' : '0%',
        status: isRunning ? 'RUNNING' : 'STOPPED',
        warning: (!isRunning && id.length % 2 === 0) ? 'Maintenance Required' : undefined
    };
}

const machines = computed(() => {
    // Access visibilityVersion to create reactive dependency
    const _ = visibilityVersion.value;
    const configMachines = plantConfig.value.machines || [];
    return configMachines
        .filter(m => {
            // Check visibility for this machine
            const key = `SHOW_MACHINE_${m.id}`;
            return isVisible(key, { plantId: plantId.value });
        })
        .map(m => {
            const stats = getDummyStats(m.id);
            return {
                id: m.id, // Keep ID for navigation
                name: m.name,
                ...stats
            };
        });
});

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
    router.push(`/plant/${plantId.value}/${path}`);
}

function navigateToMachine(machineId: string) {
    router.push(`/plant/${plantId.value}/production/machine/${machineId}`);
}

const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

async function fetchEnergyData() {
    if (plantId.value !== 'cikupa') return; // Only real for Cikupa for now
    
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

let timer: ReturnType<typeof setInterval>;

onMounted(() => {
    updateShiftStatus();
    timer = setInterval(updateShiftStatus, 60000); // Update every minute
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
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
                <div class="util-left">
                    <div class="util-icon">
                        <component :is="u.icon" class="w-5 h-5" />
                    </div>
                    <span class="u-label">{{ u.label }}</span>
                </div>
                <div class="util-right">
                    <span class="u-val">{{ u.val }}</span>
                    <span class="u-unit">{{ u.unit }}</span>
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
                @click="navigateToMachine(m.id)"
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
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 1rem;
}

.util-card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 10px;
    padding: 1rem 1.25rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    transition: all 0.2s;
}
.util-card:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); }

.util-left {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    flex: 1;
    min-width: 0; 
}

.util-icon { 
    color: #facc15; 
    background: rgba(255,255,255,0.05);
    padding: 0.5rem;
    border-radius: 6px;
    flex-shrink: 0;
}
.util-card:hover .util-icon { background: #3b82f6; color: white; }

.u-label { 
    font-size: 0.75rem; 
    color: #94a3b8; 
    font-weight: 600; 
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}

.util-right {
    text-align: right;
    margin-left: 0.5rem;
    flex-shrink: 0;
}

.u-val { font-size: 1.1rem; font-weight: 700; color: white; display: block; line-height: 1; }
.u-unit { font-size: 0.7rem; color: #64748b; font-weight: 500; display: block; margin-top: 0.2rem; }

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
