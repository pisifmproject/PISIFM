<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { 
    Zap, 
    Cloud, 
    Droplet, 
    Wind, 
    Box, 
    Flame, 
    ArrowLeft,
    Gauge,
    Leaf
} from 'lucide-vue-next';
import { getLvmdpTrend, getLvmdpShiftToday } from '@/lib/api';
// Chart
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
  DataZoomComponent,
]);

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as string);
const plantConfig = computed(() => PLANTS[plantId.value as keyof typeof PLANTS] || PLANTS['cikupa']);

// --- Types & Constants ---
type Period = 'Day' | 'Week' | 'Month' | 'Year';
const PERIODS: Period[] = ['Day', 'Week', 'Month', 'Year'];

// --- State ---
const selectedPeriod = ref<Period>('Day');
const isLoading = ref(false);
const totalEnergy = ref(0);
const productionOutput = ref(15600); // Dummy production for SEC calculation

// Metrics (Dummy but alive)
const secMetric = ref({ val: 243.59, baseline: 255.77, unit: 'kWh/ton' });
const carbonMetric = ref({ val: 3.23, factor: 0.85, unit: 'Ton CO2e' });

// Utility List
const utilities = ref([
    { id: 'electricity', label: 'Electricity', val: 0, target: 6.79, unit: 'kWh', icon: Zap, route: 'electricity' },
    { id: 'steam', label: 'Steam', val: 21.3, target: null, unit: 'Ton', icon: Cloud, route: 'steam' },
    { id: 'water', label: 'Water', val: 529.6, target: null, unit: 'm³', icon: Droplet, route: 'water' },
    { id: 'compressed-air', label: 'Compressed Air', val: 21074.13, target: null, unit: 'Nm³', icon: Wind, route: 'compressed-air' },
    { id: 'nitrogen', label: 'Nitrogen', val: 547.51, target: null, unit: 'Nm³', icon: Box, route: 'nitrogen' },
    { id: 'gas', label: 'Natural Gas', val: 1393.57, target: null, unit: 'Nm³', icon: Flame, route: 'gas' }
]);

// --- Chart Config ---
const chartOption = ref({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    legend: { textStyle: { color: '#94a3b8' }, top: 0, right: 0 },
    grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
    xAxis: {
        type: 'category',
        boundaryGap: false,
        data: ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '23:59'],
        axisLine: { lineStyle: { color: '#334155' } },
        axisLabel: { color: '#94a3b8' }
    },
    yAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
        axisLabel: { color: '#94a3b8' },
        name: 'SEC (kWh/Ton)',
        nameTextStyle: { color: '#64748b' }
    },
    series: [
        {
            name: 'Actual SEC',
            type: 'line',
            smooth: true,
            showSymbol: false,
            data: [240, 245, 242, 250, 248, 243, 246],
            lineStyle: { color: '#3b82f6', width: 3 },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: 'rgba(59, 130, 246, 0.3)' },
                        { offset: 1, color: 'rgba(59, 130, 246, 0)' }
                    ]
                }
            }
        },
        {
            name: 'Target (Baseline)',
            type: 'line',
            data: [255, 255, 255, 255, 255, 255, 255],
            symbol: 'none',
            lineStyle: { type: 'dashed', color: '#f87171' }
        }
    ]
});

// --- Methods ---

function goBack() {
    router.push(`/plant/${plantId.value}`);
}

function navigateTo(routeSuffix: string) {
    router.push(`/plant/${plantId.value}/energy/${routeSuffix}`);
}

const formatNumber = (num: number, decimals = 0) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};

async function fetchEnergyData() {
    isLoading.value = true;
    
    // Update Chart based on period
    updateChart(selectedPeriod.value);
    
    // For Cikupa, fetch real energy
    if (plantId.value === 'cikupa') {
        try {
            let total = 0;
            const now = new Date();
            const todayStr = now.toISOString().split('T')[0];

            for (let i = 1; i <= 4; i++) {
                let panelsTotal = 0;
                if (selectedPeriod.value === 'Day') {
                     try {
                         const shiftData = await getLvmdpShiftToday(i as 1|2|3|4);
                         if (shiftData) {
                             panelsTotal += (shiftData.shift1?.totalKwh || 0) + (shiftData.shift2?.totalKwh || 0) + (shiftData.shift3?.totalKwh || 0);
                         }
                     } catch (err) { console.warn(`Failed fetch LVMDP ${i}`, err); }
                } else {
                    const periodKey = selectedPeriod.value.toLowerCase() as 'week' | 'month' | 'year';
                    try {
                        const res = await getLvmdpTrend(i as 1|2|3|4, periodKey, todayStr);
                        if (res && res.data) panelsTotal = res.data.reduce((a, b) => a + b, 0);
                    } catch (err) { console.warn(`Failed fetch trend ${i}`, err); }
                }
                total += panelsTotal;
            }
            totalEnergy.value = total;
        } catch (e) {
            console.error(e);
            totalEnergy.value = 0;
        }
    } else {
        // Dummy for others
        totalEnergy.value = Math.random() * 5000 + 3000;
    }

    // Update Electricity in list
    const elec = utilities.value.find(u => u.id === 'electricity');
    if (elec) {
        elec.val = totalEnergy.value;
    }

    // Randomize other dummy data slightly to make it "alive"
    utilities.value.forEach(u => {
        if (u.id !== 'electricity') {
            const base = u.id === 'steam' ? 20 : u.id === 'water' ? 500 : 20000;
            u.val = parseFloat((Math.random() * (base * 0.2) + base).toFixed(2));
        }
    });

    secMetric.value.val = parseFloat((totalEnergy.value / (productionOutput.value / 1000) * 0.8).toFixed(2)) || 243.59;
    
    isLoading.value = false;
}

function updateChart(period: Period) {
    let xAxisData: string[] = [];
    let seriesData: number[] = [];
    let baselineData: number[] = [];

    if (period === 'Day') {
        xAxisData = ['0:00', '4:00', '8:00', '12:00', '16:00', '20:00', '23:59'];
        seriesData = [240, 245, 242, 250, 248, 243, 246];
    } else if (period === 'Week') {
        xAxisData = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        seriesData = [235, 240, 248, 252, 245, 230, 225];
    } else if (period === 'Month') {
        xAxisData = Array.from({length: 15}, (_, i) => `${i*2+1}`);
        seriesData = Array.from({length: 15}, () => 230 + Math.random() * 30);
    } else { // Year
        xAxisData = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        seriesData = Array.from({length: 12}, () => 220 + Math.random() * 40);
    }
    
    const avg = seriesData.reduce((a,b)=>a+b,0)/seriesData.length;
    baselineData = new Array(xAxisData.length).fill(parseFloat((avg * 1.05).toFixed(2)));

    // Deep merge or specific property update
    chartOption.value = {
        ...chartOption.value,
        xAxis: {
            ...chartOption.value.xAxis,
            data: xAxisData
        },
        series: [
            {
                ...chartOption.value.series[0],
                data: seriesData
            },
            {
                ...chartOption.value.series[1],
                data: baselineData
            }
        ]
    };
}

watch([selectedPeriod, plantId], () => {
    fetchEnergyData();
}, { immediate: true });

</script>

<template>
  <div class="page-container">
    <!-- Header -->
    <div class="header-section">
        <div class="flex items-center gap-4">
            <button @click="goBack" class="back-btn">
                <ArrowLeft class="w-5 h-5" />
            </button>
            <div>
                <div class="flex items-center gap-2">
                    <Leaf class="w-5 h-5 text-green-400" />
                    <h1 class="title">Utilities & Energy Efficiency</h1>
                </div>
                <p class="subtitle">Plant {{ plantConfig.name }} • Resource Consumption</p>
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

    <!-- Top Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <!-- SEC (Specific Energy Consumption) -->
        <div class="metric-card bg-blue-grad">
            <div class="mc-header">
                <span class="mc-label">EFFICIENCY METRIC</span>
                <div class="mc-icon"><Gauge class="w-5 h-5" /></div>
            </div>
            <div class="mt-2">
                <h3 class="mc-title">Specific Energy Cons.</h3>
                <div class="flex items-baseline gap-2 mt-1">
                    <span class="mc-val text-blue-400">{{ formatNumber(secMetric.val, 2) }}</span>
                    <span class="mc-unit">kWh/Ton</span>
                </div>
                <div class="mc-footer mt-4 flex justify-between">
                    <span>Baseline: {{ secMetric.baseline }}</span>
                    <span class="text-green-400 font-bold">Efficient</span>
                </div>
            </div>
        </div>

        <!-- Carbon Footprint -->
        <div class="metric-card">
            <div class="mc-header">
                <span class="mc-label">ENVIRONMENT</span>
                <div class="mc-icon green"><Leaf class="w-5 h-5" /></div>
            </div>
            <div class="mt-2">
                <h3 class="mc-title">Carbon Footprint</h3>
                <div class="flex items-baseline gap-2 mt-1">
                    <span class="mc-val text-green-400">{{ formatNumber(carbonMetric.val, 2) }}</span>
                    <span class="mc-unit">Ton CO2e</span>
                </div>
                <div class="mc-footer mt-4 flex justify-between">
                    <span>Factor: {{ carbonMetric.factor }} kg/kWh</span>
                    <span class="text-green-400">⬇ 2.4%</span>
                </div>
            </div>
        </div>

        <!-- Total Energy -->
        <div class="metric-card">
             <div class="mc-header">
                <span class="mc-label">CONSUMPTION</span>
                <div class="mc-icon yellow"><Zap class="w-5 h-5" /></div>
            </div>
            <div class="mt-2">
                <h3 class="mc-title">Total Energy</h3>
                 <div class="flex items-baseline gap-2 mt-1">
                    <span class="mc-val text-yellow-400">
                        {{ isLoading ? 'Loading...' : formatNumber(totalEnergy) }}
                    </span>
                    <span class="mc-unit">kWh</span>
                </div>
                <div class="mc-footer mt-4 text-gray-400">
                    Vs Production: {{ formatNumber(productionOutput) }} kg
                </div>
            </div>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Chart Section -->
        <div class="lg:col-span-2 card p-6">
            <h3 class="card-title mb-4">Energy Efficiency Trend (SEC) vs Baseline</h3>
            <div class="h-[400px]">
                <v-chart class="chart" :option="chartOption" autoresize />
            </div>
        </div>

        <!-- Utility Breakdown -->
        <div class="card p-6">
            <h3 class="card-title mb-4">Utility Breakdown</h3>
            <div class="flex flex-col gap-3">
                <div 
                    v-for="u in utilities" 
                    :key="u.id" 
                    class="util-row"
                    @click="navigateTo(u.route)"
                >
                    <div class="flex items-center gap-3">
                        <div class="u-icon-box">
                            <component :is="u.icon" class="w-5 h-5" />
                        </div>
                        <div>
                            <div class="u-name">{{ u.label }}</div>
                            <div class="u-target text-xs text-gray-500">Target: {{ u.target || 'NaN' }}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="u-val">{{ u.val > 0 ? formatNumber(u.val, u.id === 'electricity' ? 0 : 2) : '-' }}</div>
                        <div class="u-unit text-xs text-gray-500">{{ u.unit }}</div>
                    </div>
                </div>
            </div>
        </div>
    </div>

  </div>
</template>

<style scoped>
.page-container {
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
.title { font-size: 1.5rem; font-weight: 700; color: white; }
.subtitle { color: #94a3b8; font-size: 0.9rem; margin-top: 0.25rem; }
.back-btn { background: transparent; border: none; color: #94a3b8; padding: 0.5rem; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(255,255,255,0.1); color: white; }

.time-filters {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 8px; padding: 0.25rem; display: flex; gap: 0.25rem;
}
.filter-btn {
    background: transparent; border: none; color: #94a3b8; padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: all 0.2s;
}
.filter-btn:hover { color: white; }
.filter-btn.active { background: #2563eb; color: white; }

/* Metrics */
.metric-card {
    background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;
}
.bg-blue-grad {
    background: linear-gradient(135deg, rgba(30, 41, 59, 1) 0%, rgba(15, 23, 42, 1) 100%);
}
.mc-header { display: flex; justify-content: space-between; align-items: flex-start; }
.mc-label { font-size: 0.7rem; color: #94a3b8; font-weight: 600; text-transform: uppercase; }
.mc-icon { background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 8px; color: #94a3b8; }
.mc-icon.green { color: #4ade80; background: rgba(74, 222, 128, 0.1); }
.mc-icon.yellow { color: #facc15; background: rgba(250, 204, 21, 0.1); }

.mc-title { font-size: 1.1rem; font-weight: 600; color: white; }
.mc-val { font-size: 2rem; font-weight: 700; }
.mc-unit { font-size: 0.85rem; color: #64748b; font-weight: 500; }
.mc-footer { font-size: 0.8rem; color: #94a3b8; }

/* Main Cards */
.card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; }
.card-title { font-size: 1rem; font-weight: 600; color: #cbd5e1; }

.chart { width: 100%; height: 100%; }

/* Utility Row */
.util-row {
    background: #0f172a; border: 1px solid #334155; border-radius: 8px; padding: 1rem;
    display: flex; justify-content: space-between; align-items: center;
    cursor: pointer; transition: all 0.2s;
}
.util-row:hover {
    border-color: #3b82f6; background: rgba(59, 130, 246, 0.1);
}
.u-icon-box {
    background: rgba(255,255,255,0.05); padding: 0.6rem; border-radius: 8px; color: #3b82f6;
}
.util-row:hover .u-icon-box { color: white; background: #3b82f6; }

.u-name { font-weight: 600; color: white; font-size: 0.95rem; }
.u-val { font-weight: 700; color: white; font-size: 1rem; }

/* Colors */
.text-green-400 { color: #4ade80; }
.text-blue-400 { color: #60a5fa; }
.text-yellow-400 { color: #facc15; }

/* Grid Utils */
.grid { display: grid; }
.grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)); }
.md\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lg\:grid-cols-3 { grid-template-columns: repeat(3, minmax(0, 1fr)); }
.lg\:col-span-2 { grid-column: span 2 / span 2; }
.gap-6 { gap: 1.5rem; }
.mb-6 { margin-bottom: 1.5rem; }
.mb-4 { margin-bottom: 1rem; }
.mt-2 { margin-top: 0.5rem; }
.mt-4 { margin-top: 1rem; }
.p-6 { padding: 1.5rem; }
.h-\[400px\] { height: 400px; }
.flex { display: flex; }
.flex-col { flex-direction: column; }
.items-center { align-items: center; }
.items-baseline { align-items: baseline; }
.justify-between { justify-content: space-between; }
.gap-2 { gap: 0.5rem; }
.gap-3 { gap: 0.75rem; }
.gap-4 { gap: 1rem; }
.bg-blue-grad { background-image: linear-gradient(to bottom right, #1e293b, #0f172a); }
</style>
