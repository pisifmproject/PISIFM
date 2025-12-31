<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { 
    Cloud, 
    Droplet, 
    Wind, 
    Box, 
    Flame, 
    ArrowLeft,
    Gauge,
    Thermometer,
    Activity,
    Sparkles
} from 'lucide-vue-next';
import { PLANTS } from '@/config/app.config';
import { use } from 'echarts/core';
import { CanvasRenderer } from 'echarts/renderers';
import { LineChart } from 'echarts/charts';
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent // Add TitleComponent here
} from 'echarts/components';
import VChart from 'vue-echarts';

// Register ECharts components
use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

const props = defineProps<{
    type: string; // 'steam', 'water', 'compressed-air', 'nitrogen', 'gas'
}>();

const route = useRoute();
const router = useRouter();

// --- Configuration ---
const plantId = computed(() => route.params.plantId as string);
const plant = computed(() => PLANTS[plantId.value as keyof typeof PLANTS] || { name: 'Unknown', location: 'Unknown' });

const CONFIG: Record<string, any> = {
    'steam': {
        label: 'Steam',
        unit: 'Ton',
        target: 20,
        color: '#f43f5e', // Rose 500
        icon: Cloud,
        metrics: [
            { label: 'PRESSURE', unit: 'bar', min: 9, max: 12, icon: Gauge },
            { label: 'FLOW RATE', unit: 'Ton/h', min: 0.5, max: 1.5, icon: Activity },
            { label: 'TEMP', unit: '°C', min: 180, max: 195, icon: Thermometer }
        ]
    },
    'water': {
        label: 'Water',
        unit: 'm³',
        target: 500,
        color: '#3b82f6', // Blue 500
        icon: Droplet,
        metrics: [
            { label: 'PH LEVEL', unit: 'pH', min: 6.5, max: 7.5, icon: Activity },
            { label: 'FLOW RATE', unit: 'm³/h', min: 10, max: 50, icon: Activity },
            { label: 'TDS', unit: 'ppm', min: 100, max: 300, icon: Sparkles }
        ]
    },
    'compressed-air': {
        label: 'Compressed Air',
        unit: 'Nm³',
        target: 22000,
        color: '#eab308', // Yellow 500
        icon: Wind,
        metrics: [
            { label: 'PRESSURE', unit: 'bar', min: 6, max: 8, icon: Gauge },
            { label: 'FLOW', unit: 'Nm³/h', min: 1000, max: 3000, icon: Activity },
            { label: 'DEW POINT', unit: '°C', min: 2, max: 5, icon: Thermometer }
        ]
    },
    'nitrogen': {
        label: 'Nitrogen',
        unit: 'Nm³',
        target: 600,
        color: '#a855f7', // Purple 500
        icon: Box,
        metrics: [
            { label: 'PURITY', unit: '%', min: 99.5, max: 99.99, icon: Sparkles },
            { label: 'FLOW', unit: 'Nm³/h', min: 10, max: 30, icon: Activity },
            { label: 'PRESSURE', unit: 'bar', min: 5, max: 7, icon: Gauge }
        ]
    },
    'gas': {
        label: 'Natural Gas',
        unit: 'Nm³',
        target: 1600,
        color: '#22c55e', // Green 500
        icon: Flame,
        metrics: [
            { label: 'PRESSURE', unit: 'bar', min: 2, max: 4, icon: Gauge },
            { label: 'FLOW', unit: 'Nm³/h', min: 50, max: 150, icon: Activity },
            { label: 'TEMP', unit: '°C', min: 25, max: 35, icon: Thermometer }
        ]
    }
};

const currentConfig = computed(() => CONFIG[props.type] || CONFIG['steam']);

// --- State ---
const selectedPeriod = ref('Day');
const periods = ['Day', 'Week', 'Month', 'Year'];

// Live Data
const consumption = ref(0);
const metricsValues = ref([0, 0, 0]);
const chartData = ref<number[]>([]);

// --- Helpers ---
function randomRange(min: number, max: number) {
    return Math.random() * (max - min) + min;
}

function generateChartData() {
    return Array.from({ length: 24 }, () => randomRange(0.5, 2)); // Normalized-ish data
}

function updateData() {
    // Update main consumption
    // target +/- 20%
    const target = currentConfig.value.target;
    consumption.value = randomRange(target * 0.8, target * 1.2);

    // Update bottom metrics
    metricsValues.value = currentConfig.value.metrics.map((m: any) => randomRange(m.min, m.max));

    // Update chart (shift buffer)
    // We'll just regenerate for "refresh" feel or shift
    // Let's shift 1 and add 1
    const newData = [...chartData.value];
    newData.shift();
    newData.push(randomRange(0, 1.5));
    chartData.value = newData;
}

// --- Chart Options ---
const chartOption = computed(() => {
    const color = currentConfig.value.color;
    return {
        backgroundColor: 'transparent',
        grid: { top: 30, right: 20, bottom: 20, left: 40, containLabel: true },
        tooltip: { trigger: 'axis' },
        xAxis: {
            type: 'category',
            data: Array.from({length: 24}, (_, i) => `${i}:00`),
            axisLine: { lineStyle: { color: '#64748b' } },
            axisLabel: { color: '#94a3b8', fontSize: 10 }
        },
        yAxis: {
            type: 'value',
            splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
            axisLabel: { color: '#94a3b8' }
        },
        series: [{
            data: chartData.value,
            type: 'line',
            smooth: true,
            symbol: 'none',
            lineStyle: { color: color, width: 2 },
            areaStyle: {
                color: {
                    type: 'linear',
                    x: 0, y: 0, x2: 0, y2: 1,
                    colorStops: [
                        { offset: 0, color: color + '66' }, // 40% opacity
                        { offset: 1, color: color + '00' }  // 0% opacity
                    ]
                }
            }
        }]
    };
});

// --- Lifecycle ---
let timer: ReturnType<typeof setInterval>;

onMounted(() => {
    chartData.value = generateChartData();
    updateData(); // Initial
    timer = setInterval(updateData, 3000);
});

onUnmounted(() => {
    if (timer) clearInterval(timer);
});

function goBack() {
    router.push(`/plant/${plantId.value}`);
}
</script>

<template>
<div class="page-container">
    <!-- Header -->
    <div class="header-bar">
        <div class="flex items-center gap-4">
             <button @click="goBack" class="back-btn">
                <ArrowLeft class="w-6 h-6" />
            </button>
            <div class="header-icon" :style="{ color: currentConfig.color }">
                <component :is="currentConfig.icon" class="w-8 h-8"/>
            </div>
            <div>
                <h1 class="page-title">{{ currentConfig.label }} Dashboard</h1>
                <p class="page-subtitle">Plant {{ plant.name }} • Utility Monitoring System</p>
            </div>
        </div>
        <div class="period-selector">
            <button 
                v-for="p in periods" 
                :key="p" 
                class="p-btn"
                :class="{ active: selectedPeriod === p }"
                @click="selectedPeriod = p"
            >
                {{ p }}
            </button>
        </div>
    </div>

    <!-- Main Content -->
     <div class="dashboard-grid">
         <!-- Left: Resource Efficiency -->
         <div class="card efficiency-card">
            <div class="card-header">
                <h2 class="card-title">
                    <span class="icon-indicator">↗</span> Resource Efficiency
                </h2>
                <component :is="currentConfig.icon" class="watermark-icon" />
            </div>

            <div class="consumption-section">
                <div class="labels">
                    <span>CURRENT CONSUMPTION (DUMMY Value)</span>
                    <span>TARGET ({{ currentConfig.target }} {{ currentConfig.unit }})</span>
                </div>
                
                <!-- Progress Bar -->
                <div class="progress-track">
                    <div 
                        class="progress-fill" 
                        :style="{ width: Math.min((consumption / currentConfig.target) * 100, 100) + '%', background: currentConfig.color }"
                    >
                        <div class="stripes"></div>
                    </div>
                </div>

                <div class="values-row">
                    <div class="main-val" :style="{ color: currentConfig.color }">
                        {{ consumption.toLocaleString('id-ID', { maximumFractionDigits: 2 }) }} 
                        <span class="unit">{{ currentConfig.unit }} (Actual)</span>
                    </div>
                    <div class="percent-val">
                        <span class="big-percent" :style="{ color: currentConfig.color }">
                            {{ ((consumption / currentConfig.target) * 100).toFixed(2) }}%
                        </span>
                        <span class="sub-percent">VS TARGET</span>
                    </div>
                </div>
            </div>

            <div class="metrics-footer">
                <div class="footer-metric" v-for="(m, idx) in currentConfig.metrics" :key="idx">
                    <div class="fm-label">
                         <component :is="m.icon" class="w-3 h-3 inline mr-1" />
                        {{ m.label }}
                    </div>
                    <div class="fm-value">
                        {{ metricsValues[idx].toLocaleString('id-ID', { maximumFractionDigits: 2 }) }} 
                        <small>{{ m.unit }}</small>
                    </div>
                </div>
            </div>
         </div>

         <!-- Right: Trend -->
         <div class="card trend-card">
             <div class="card-header">
                 <h2 class="card-title">Usage Trend ({{ selectedPeriod }})</h2>
             </div>
             <div class="chart-container">
                 <v-chart class="chart" :option="chartOption" autoresize />
             </div>
             <div class="trend-footer">
                 <span>Total: {{ consumption.toLocaleString('id-ID', { maximumFractionDigits: 2 }) }} {{ currentConfig.unit }}</span>
                 <span class="trend-badge">▲ 8% vs prev</span>
             </div>
         </div>
     </div>
</div>
</template>

<style scoped>
.page-container {
    padding: 1.5rem;
    color: #e2e8f0;
    max-width: 1800px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
}

/* Header */
.header-bar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
}
.back-btn {
    background: transparent; border: none; color: #94a3b8; cursor: pointer;
    transition: color 0.2s;
}
.back-btn:hover { color: white; }

.header-icon {
    background: #1e293b;
    padding: 0.75rem;
    border-radius: 12px;
    display: flex; align-items: center; justify-content: center;
    border: 1px solid #334155;
}

.page-title { font-size: 1.5rem; font-weight: 700; color: white; margin: 0; }
.page-subtitle { color: #64748b; font-size: 0.85rem; margin-top: 0.25rem; font-weight: 500; }

.period-selector {
    background: #0f172a;
    border: 1px solid #1e293b;
    padding: 0.25rem;
    border-radius: 8px;
    display: flex; gap: 0.25rem;
}
.p-btn {
    background: transparent; border: none; color: #94a3b8;
    padding: 0.5rem 1rem; border-radius: 6px; font-size: 0.8rem; font-weight: 600;
    cursor: pointer; transition: all 0.2s;
}
.p-btn:hover { color: white; }
.p-btn.active { background: #2563eb; color: white; }

/* Grid */
.dashboard-grid {
    display: grid;
    grid-template-columns: 1.8fr 1.2fr;
    gap: 1.5rem;
}
@media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }

.card {
    background: #1e293b;
    border: 1px solid #334155;
    border-radius: 16px;
    padding: 1.5rem;
    display: flex; flex-direction: column;
    position: relative;
    overflow: hidden;
}

.card-title {
    font-size: 1rem; color: #cbd5e1; font-weight: 600; margin-bottom: 1.5rem;
    display: flex; align-items: center; gap: 0.5rem;
}
.icon-indicator { color: #3b82f6; font-size: 1.2rem; }

/* Efficiency Card */
.efficiency-card { justify-content: space-between; min-height: 400px; }
.watermark-icon {
    position: absolute; top: -10px; right: -10px;
    width: 150px; height: 150px;
    color: rgba(255,255,255,0.03);
    transform: rotate(15deg);
    pointer-events: none;
}

.consumption-section { position: relative; z-index: 1; flex: 1; display: flex; flex-direction: column; justify-content: center; }

.labels { 
    display: flex; justify-content: space-between; 
    font-size: 0.75rem; color: #94a3b8; font-weight: 600; 
    margin-bottom: 0.75rem;
}

.progress-track {
    height: 24px;
    background: #0f172a;
    border-radius: 12px;
    overflow: hidden;
    margin-bottom: 1.5rem;
    border: 1px solid #334155;
}
.progress-fill {
    height: 100%;
    border-radius: 12px;
    position: relative;
    transition: width 1s ease-out;
}
.stripes {
    position: absolute; top:0; left:0; right:0; bottom:0;
    background-image: linear-gradient(
        45deg,
        rgba(255, 255, 255, 0.15) 25%,
        transparent 25%,
        transparent 50%,
        rgba(255, 255, 255, 0.15) 50%,
        rgba(255, 255, 255, 0.15) 75%,
        transparent 75%,
        transparent
    );
    background-size: 1rem 1rem;
    animation: move 1s linear infinite;
}
@keyframes move { from { background-position: 0 0; } to { background-position: 1rem 0; } }

.values-row {
    display: flex; justify-content: space-between; align-items: flex-end;
}
.main-val { font-size: 3rem; font-weight: 700; line-height: 1; }
.main-val .unit { font-size: 1rem; color: #94a3b8; font-weight: 500; margin-left: 0.5rem; }

.percent-val { text-align: right; }
.big-percent { font-size: 1.5rem; font-weight: 700; display: block; }
.sub-percent { font-size: 0.7rem; color: #64748b; font-weight: 600; }

.metrics-footer {
    display: flex; gap: 2rem; border-top: 1px solid #334155; padding-top: 1.5rem; margin-top: 2rem;
}
.footer-metric {
    display: flex; flex-direction: column;
}
.fm-label { font-size: 0.7rem; color: #94a3b8; margin-bottom: 0.25rem; font-weight: 600; text-transform: uppercase; }
.fm-value { font-size: 1.25rem; font-weight: 700; color: white; }
.fm-value small { font-size: 0.8rem; color: #64748b; font-weight: 400; margin-left: 0.2rem; }

/* Trend Card */
.trend-card { min-height: 400px; }
.chart-container { flex: 1; width: 100%; min-height: 250px; }
.chart { width: 100%; height: 100%; }

.trend-footer {
    display: flex; justify-content: space-between; align-items: center;
    border-top: 1px dashed #334155; padding-top: 1rem; margin-top: 1rem;
    font-size: 0.85rem; color: #94a3b8;
}
.trend-badge {
    color: #f87171; background: rgba(248, 113, 113, 0.1); 
    padding: 0.25rem 0.5rem; border-radius: 4px; font-weight: 600; font-size: 0.75rem;
}
</style>
