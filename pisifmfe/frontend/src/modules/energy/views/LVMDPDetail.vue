<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { lvmdpService } from "../services/lvmdp.service";
import { getShiftAvg, getDailyHourly, getLvmdpShiftToday } from "@/lib/api";
import type { LVMDPData } from "../models";
import { PLANTS } from "@/config/app.config";
import { 
  Zap, 
  Activity, 
  ArrowLeft, 
  Battery, 
  Clock
} from "lucide-vue-next";

// ECharts
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  GridComponent,
  TooltipComponent,
  TitleComponent,
  LegendComponent
]);

// Route & navigation
const route = useRoute();
const router = useRouter();
const plantId = computed(() => route.params.plantId as string);
const lvmdpId = computed(() => Number(route.params.lvmdpId));
const plant = computed(() => PLANTS[plantId.value as keyof typeof PLANTS]);
const isRealData = computed(() => plant.value?.useRealData ?? false);

// State
const realtimeData = ref<LVMDPData | null>(null);
const loading = ref(true);
const shiftData = ref<any[]>([]); // Shift 1-3
const timeFilter = ref<'Day' | 'Week' | 'Month' | 'Year'>('Day');

// Chart options
const chartOption = ref<any>({
  backgroundColor: 'transparent',
  grid: { left: '3%', right: '4%', bottom: '3%', top: '15%', containLabel: true },
  tooltip: { trigger: 'axis' },
  xAxis: {
    type: 'category',
    data: [], // 00:00 - 23:00
    axisLine: { show: false },
    axisTick: { show: false },
    axisLabel: { color: '#94a3b8', fontSize: 10 }
  },
  yAxis: {
    type: 'value',
    name: 'Energy (kWh)',
    nameTextStyle: { color: '#94a3b8', padding: [0, 0, 0, 20] },
    splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
    axisLabel: { color: '#94a3b8', fontSize: 10 }
  },
  series: [{
    data: [],
    type: 'line',
    smooth: true,
    symbol: 'none',
    itemStyle: { color: '#eab308' },
    areaStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: 'rgba(234, 179, 8, 0.3)' },
          { offset: 1, color: 'rgba(234, 179, 8, 0)' }
        ]
      }
    }
  }]
});

// Initialization
let unsubscribe: (() => void) | null = null;

const goBack = () => router.back();

// Helper to determine Shift Status with User's specific logic
function getShiftStatus(id: number): 'ACTIVE' | 'COMPLETED' | 'UPCOMING' {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const totalMinutes = hours * 60 + minutes;

    // Shift 1: 07:01 - 14:30
    const shift1Start = 7 * 60 + 1; // 421
    const shift1End = 14 * 60 + 30; // 870
    
    // Shift 2: 14:31 - 22:00
    const shift2Start = 14 * 60 + 31; // 871
    const shift2End = 22 * 60; // 1320
    
    // Shift 3: 22:01 - 07:00
    const shift3Start = 22 * 60 + 1; // 1321
    const shift3End = 7 * 60; // 420

    if (id === 1) {
        if (totalMinutes >= shift1Start && totalMinutes <= shift1End) {
            return 'ACTIVE';
        } else if (totalMinutes < shift1Start) {
            return 'UPCOMING';
        } else {
            return 'COMPLETED';
        }
    } else if (id === 2) {
        if (totalMinutes >= shift2Start && totalMinutes <= shift2End) {
            return 'ACTIVE';
        } else if (totalMinutes < shift2Start) {
            return 'UPCOMING';
        } else {
            return 'COMPLETED';
        }
    } else {
        // Shift 3 (crosses midnight)
        if (totalMinutes >= shift3Start || totalMinutes <= shift3End) {
            return 'ACTIVE';
        } else if (totalMinutes > shift3End && totalMinutes < shift3Start) {
            return 'UPCOMING';
        } else {
            return 'UPCOMING';
        }
    }
}

function createEmptyShift(id: number) {
    return { 
        id, 
        kwh: '-', 
        avgPower: '-', 
        avgLoad: '-', 
        avgCurrent: '-', 
        maxCurrent: '-', 
        avgPf: '-',
        status: getShiftStatus(id)
    };
}

function mockChartData() {
    const hours = Array.from({length: 24}, (_, i) => `${i}:00`);
    const values = hours.map(() => 15 + Math.random() * 10);
    chartOption.value.xAxis.data = hours;
    chartOption.value.series[0].data = values;
}

function mockShiftData() {
    shiftData.value = [
        { id: 1, kwh: '1204.85', avgPower: '225.1', avgLoad: '14.69', avgCurrent: '552.53', maxCurrent: '552.53', avgPf: '0.92', status: getShiftStatus(1) },
        { id: 2, kwh: '1555.01', avgPower: '245.8', avgLoad: '14.36', avgCurrent: '558.97', maxCurrent: '558.97', avgPf: '0.92', status: getShiftStatus(2) },
        { id: 3, kwh: '-', avgPower: '-', avgLoad: '-', avgCurrent: '-', maxCurrent: '-', avgPf: '-', status: getShiftStatus(3) },
    ];
}

// Data Fetching
const fetchHistoricalData = async () => {
    if (!lvmdpId.value) return;
    
    // 1. Chart Data (Hourly)
    try {
       // Only if user wants real data and likely restricted to panel 1 or mocked data logic
       if (isRealData.value && lvmdpId.value === 1) { 
           // If backend is ready, uncomment:
           // const now = new Date();
           // const dateStr = now.toISOString().split('T')[0];
           // const hourly = await getDailyHourly(lvmdpId.value as any, dateStr);
           // ... process ...
           mockChartData(); 
       } else {
           mockChartData();
       }
    } catch (e) {
        console.error("Chart fetch error", e);
        mockChartData();
    }

    // 2. Shift Data
    try {
        if (isRealData.value && plantId.value === 'cikupa') {
            // Use real data from database for Plant Cikupa
            const shifts = await getLvmdpShiftToday(lvmdpId.value as any).catch(() => null);
            
            if (shifts) {
                console.log(`[LVMDP${lvmdpId.value}] Shift data from DB:`, shifts);
                
                // Map API response to UI table
                shiftData.value = [1, 2, 3].map(id => {
                   const s = (shifts as any)[`shift${id}`];
                   
                   // If no data for this shift, show empty
                   if (!s || s.totalKwh === 0) {
                       return createEmptyShift(id);
                   }
                   
                   return {
                       id,
                       kwh: s.totalKwh.toFixed(2),
                       avgPower: s.avgKwh.toFixed(1),
                       avgLoad: s.avgCurrent.toFixed(2),
                       avgCurrent: s.minCurrent.toFixed(2),
                       maxCurrent: s.maxCurrent.toFixed(2),
                       avgPf: s.cosPhi.toFixed(2),
                       status: getShiftStatus(id)
                   };
                });
            } else {
                // Fallback if endpoint fails
                console.warn(`[LVMDP${lvmdpId.value}] Failed to fetch shift data, using mock`);
                mockShiftData(); 
            }
        } else {
            // Use dummy data for other plants
            mockShiftData();
        }
    } catch (e) {
        console.error("Shift data error", e);
        mockShiftData();
    }
};


watch([plantId, lvmdpId], () => {
    if (unsubscribe) unsubscribe();
    loading.value = true;
    
    // Subscribe Real-time
    unsubscribe = lvmdpService.subscribe(plantId.value, lvmdpId.value, (data) => {
        realtimeData.value = data;
        loading.value = false;
    });

    // Fetch Historical
    fetchHistoricalData();
    
}, { immediate: true });

onUnmounted(() => {
    if (unsubscribe) unsubscribe();
});

// Formatters
const fmt = (val: number | undefined, dec = 1) => val ? val.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '-';
</script>

<template>
  <div class="lvmdp-dashboard">
    <!-- Header -->
    <div class="dash-header">
       <button class="back-link" @click="goBack">
           <ArrowLeft class="w-5 h-5" />
       </button>
       <div class="header-titles">
           <div class="title-row">
               <h1>Main Panel {{ lvmdpId }}</h1>
               <span class="status-badge" :class="realtimeData?.isConnected ? 'normal' : 'alarm'">
                   {{ realtimeData?.isConnected ? 'NORMAL' : 'OFFLINE' }}
               </span>
           </div>
           <p class="subtitle">Power Distribution Panel</p>
       </div>
       
       <div class="time-filters">
           <button 
             v-for="t in ['Day', 'Week', 'Month', 'Year']" 
             :key="t"
             :class="{ active: timeFilter === t }"
             @click="timeFilter = t as any"
           >
             {{ t }}
           </button>
       </div>
    </div>

    <!-- Top Metric Cards -->
    <div class="metrics-grid">
        <!-- Active Power -->
        <div class="metric-card">
            <div class="m-header">
                <span>ACTIVE POWER</span>
                <div class="icon-sq yellow"><Zap class="w-4 h-4" /></div>
            </div>
            <div class="m-value">
                {{ fmt(realtimeData?.activePower, 0) }} <small>kW</small>
            </div>
            <div class="m-trend positive">
                ↑ 2,4% vs yesterday
            </div>
        </div>

        <!-- Apparent Power -->
        <div class="metric-card">
             <div class="m-header">
                <span>APPARENT POWER</span>
                <div class="icon-sq blue"><Activity class="w-4 h-4" /></div>
            </div>
            <div class="m-value">
                {{ fmt(realtimeData?.apparentPower, 1) }} <small>kVA</small>
            </div>
            <div class="m-trend negative">
                ↓ 1,1% vs yesterday
            </div>
        </div>

        <!-- Reactive Power -->
        <div class="metric-card">
             <div class="m-header">
                <span>REACTIVE POWER</span>
                <div class="icon-sq purple"><Battery class="w-4 h-4" /></div>
            </div>
            <div class="m-value">
                {{ fmt(realtimeData?.reactivePower, 1) }} <small>kVAR</small>
            </div>
            <div class="m-trend positive">
                ↑ 0,7% vs yesterday
            </div>
        </div>

        <!-- Power Factor -->
        <div class="metric-card">
             <div class="m-header">
                <span>POWER FACTOR</span>
                <div class="icon-sq green"><Zap class="w-4 h-4" /></div>
            </div>
            <div class="m-value">
                {{ fmt(realtimeData?.powerFactor, 2) }}
            </div>
            <div class="m-trend negative">
                ↓ 2% vs yesterday
            </div>
        </div>
    </div>

    <!-- Middle Section: Electrical Status & Trend -->
    <div class="middle-section">
        <!-- Live Electrical Status -->
        <div class="card status-card">
            <div class="card-header">
                <h3>Live Electrical Status</h3>
            </div>
            
            <div class="status-content">
                <div class="voltages-group">
                    <label>VOLTAGE (L-L)</label>
                    <div class="v-row">
                        <span>Voltage R-S</span>
                        <div class="v-val">
                             {{ fmt(realtimeData?.phases.r.voltageRS, 0) }} V 
                             <span class="v-trend up">▲ 0,1%</span>
                        </div>
                    </div>
                    <div class="v-row">
                        <span>Voltage S-T</span>
                        <div class="v-val">
                             {{ fmt(realtimeData?.phases.s.voltageST, 0) }} V 
                             <span class="v-trend stable">▲ 0%</span>
                        </div>
                    </div>
                    <div class="v-row">
                        <span>Voltage T-R</span>
                        <div class="v-val">
                             {{ fmt(realtimeData?.phases.t.voltageTR, 0) }} V 
                             <span class="v-trend down">▼ 0,2%</span>
                        </div>
                    </div>
                </div>

                <div class="load-group">
                    <label>CURRENT LOAD</label>
                    <div class="progress-bg">
                        <div 
                          class="progress-bar" 
                          :style="{ width: `${Math.min(((realtimeData?.avgCurrent || 0) / 2500) * 100, 100)}%` }"
                        ></div>
                    </div>
                    <div class="load-stats">
                        <div class="load-perc">
                            {{ ((realtimeData?.avgCurrent || 0) / 2500 * 100).toFixed(2) }}%
                        </div>
                        <div class="load-max">Max: 2.500 A</div>
                    </div>
                    <div class="load-avg">
                        Average Current: <span class="white">{{ fmt(realtimeData?.avgCurrent, 2) }} A</span>
                    </div>
                </div>

                <div class="freq-group">
                    <label>FREQUENCY</label>
                    <div class="freq-val">
                        {{ fmt(realtimeData?.frequency, 2) }} <small>Hz</small>
                    </div>
                </div>
            </div>
        </div>

        <!-- Energy Usage Trend -->
        <div class="card chart-card">
            <div class="card-header">
                <h3>Energy Usage Trend (Day)</h3>
            </div>
            <div class="chart-container">
                <v-chart class="chart" :option="chartOption" autoresize />
            </div>
        </div>
    </div>

    <!-- Bottom Section: Shift Performance -->
    <div class="card table-card">
        <div class="card-header">
            <h3>Shift Performance</h3>
        </div>
        <div class="table-responsive">
            <table>
                <thead>
                    <tr>
                        <th class="text-left">SHIFT</th>
                        <th class="text-right">TOTAL KWH</th>
                        <th class="text-right">AVG POWER (KW)</th>
                        <th class="text-right">AVG CURRENT (A)</th>
                        <th class="text-right">MIN CURRENT (A)</th>
                        <th class="text-right">MAX CURRENT (A)</th>
                        <th class="text-right">LOAD (%)</th>
                        <th class="text-right">POWER FACTOR</th>
                    </tr>
                </thead>
                <tbody>
                    <tr v-for="row in shiftData" :key="row.id">
                        <td class="text-left pl-6">
                            <div class="shift-cell">
                                <span class="shift-id">{{ row.id }}</span>
                                <span class="shift-badge" :class="row.status.toLowerCase()">{{ row.status }}</span>
                            </div>
                        </td>
                        <td class="text-right text-yellow">{{ row.kwh }}</td>
                        <td class="text-right">{{ row.avgPower }}</td>
                        <td class="text-right text-blue">{{ row.avgLoad }}</td>
                        <td class="text-right">{{ row.avgCurrent }}</td>
                        <td class="text-right text-green">{{ row.maxCurrent }}</td>
                        <td class="text-right text-green">
                          {{ 
                            Number(row.avgCurrent) > 0 ? ((row.avgCurrent / 2500) * 100).toFixed(1) : '-'
                          }}
                        </td>
                        <td class="text-right">{{ row.avgPf }}</td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
  </div>
</template>

<style scoped>
.lvmdp-dashboard {
    max-width: 1600px;
    margin: 0 auto;
    font-family: 'Inter', sans-serif;
    color: #cbd5e1;
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
    padding: 1rem;
}

/* Header */
.dash-header {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.back-link {
    background: transparent;
    border: none;
    color: #94a3b8;
    cursor: pointer;
    margin-top: 5px;
}

.back-link:hover { color: white; }

.header-titles {
    flex: 1;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 0.25rem;
}

.title-row h1 {
    font-size: 1.5rem;
    font-weight: 700;
    color: white;
    margin: 0;
}

.status-badge {
    font-size: 0.7rem;
    font-weight: 700;
    padding: 0.2rem 0.5rem;
    border-radius: 4px;
    text-transform: uppercase;
}

.status-badge.normal {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    border: 1px solid rgba(34, 197, 94, 0.3);
}

.status-badge.alarm {
    background: rgba(239, 68, 68, 0.2);
    color: #f87171;
    border: 1px solid rgba(239, 68, 68, 0.3);
}

.subtitle {
    font-size: 0.85rem;
    color: #94a3b8;
    margin: 0;
}

.time-filters {
    display: flex;
    background: #1e293b;
    padding: 3px;
    border-radius: 8px;
    border: 1px solid #334155;
    height: fit-content;
}

.time-filters button {
    background: transparent;
    border: none;
    color: #94a3b8;
    padding: 0.4rem 0.8rem;
    font-size: 0.8rem;
    cursor: pointer;
    border-radius: 6px;
    font-weight: 500;
    transition: all 0.2s;
}

.time-filters button.active {
    background: #3b82f6;
    color: white;
}

/* Metrics Grid */
.metrics-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1.25rem;
}

@media (max-width: 1024px) {
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
}

.metric-card {
    background: #151e32;
    border: 1px solid #2d3b55;
    border-radius: 8px;
    padding: 1.25rem;
    position: relative;
    overflow: hidden;
}

.m-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-bottom: 0.75rem;
}

.m-header span {
    font-size: 0.75rem;
    color: #94a3b8;
    font-weight: 700;
}

.icon-sq {
    width: 2rem;
    height: 2rem;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0.8;
}

.icon-sq.yellow { background: rgba(234, 179, 8, 0.2); color: #eab308; }
.icon-sq.blue { background: rgba(59, 130, 246, 0.2); color: #60a5fa; }
.icon-sq.purple { background: rgba(168, 85, 247, 0.2); color: #c084fc; }
.icon-sq.green { background: rgba(34, 197, 94, 0.2); color: #4ade80; }

.m-value {
    font-size: 1.75rem;
    font-weight: 800;
    color: white;
    margin-bottom: 0.5rem;
}

.m-value small {
    font-size: 1rem;
    color: #94a3b8;
    font-weight: 500;
}

.m-trend {
    font-size: 0.75rem;
    font-weight: 600;
}

.m-trend.positive { color: #4ade80; }
.m-trend.negative { color: #f87171; }

/* Middle Section */
.middle-section {
    display: grid;
    grid-template-columns: 1fr 2fr;
    gap: 1.25rem;
}

@media (max-width: 1200px) {
    .middle-section {
        grid-template-columns: 1fr;
    }
}

.card {
    background: #151e32;
    border: 1px solid #2d3b55;
    border-radius: 8px;
    display: flex;
    flex-direction: column;
}

.card-header {
    padding: 1rem 1.25rem;
    border-bottom: 1px solid #2d3b55;
}

.card-header h3 {
    margin: 0;
    font-size: 0.95rem;
    color: #e2e8f0;
    font-weight: 700;
}

.status-content {
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

/* Status Panel styling */
.voltages-group label, .load-group label, .freq-group label {
    display: block;
    font-size: 0.7rem;
    color: #94a3b8;
    font-weight: 700;
    margin-bottom: 1rem;
    text-transform: uppercase;
}

.v-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.75rem;
    font-size: 0.85rem;
    color: #cbd5e1;
    border-bottom: 1px solid #1e293b;
    padding-bottom: 0.5rem;
}

.v-val {
    font-weight: 700;
    color: white;
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.v-trend {
    font-size: 0.7rem;
    width: 50px;
    text-align: right;
}

.v-trend.up { color: #4ade80; }
.v-trend.down { color: #f87171; }
.v-trend.stable { color: #94a3b8; }

.progress-bg {
    height: 8px;
    background: #334155;
    border-radius: 4px;
    margin-bottom: 0.75rem;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    background: #3b82f6;
    border-radius: 4px;
    transition: width 0.5s ease;
}

.load-stats {
    display: flex;
    justify-content: space-between;
    align-items: baseline;
    margin-bottom: 0.5rem;
}

.load-perc {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
}

.load-max {
    font-size: 0.75rem;
    color: #94a3b8;
}

.load-avg {
    font-size: 0.8rem;
    color: #94a3b8;
}

.load-avg .white {
    color: white;
    font-weight: 700;
}

.freq-val {
    font-size: 1.5rem;
    font-weight: 800;
    color: white;
    text-align: right;
}

/* Chart */
.chart-container {
    height: 100%;
    min-height: 350px;
    padding: 1rem;
}

.chart {
    width: 100%;
    height: 100%;
}

/* Table */
.table-responsive {
    overflow-x: auto;
    padding: 0;
}

table {
    width: 100%;
    border-collapse: collapse;
}

th {
    background: #1e293b;
    font-size: 0.7rem;
    text-transform: uppercase;
    color: #94a3b8;
    padding: 1rem;
    font-weight: 700;
    border-bottom: 1px solid #2d3b55;
    letter-spacing: 0.05em;
}

td {
    padding: 1.25rem 1rem;
    border-bottom: 1px solid #1e293b;
    font-size: 0.9rem;
    font-weight: 600;
    color: #cbd5e1;
}

.shift-cell {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.shift-id {
    font-size: 1rem;
    font-weight: 700;
    color: white;
}

.shift-badge {
    font-size: 0.65rem;
    padding: 0.15rem 0.5rem;
    border-radius: 99px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.shift-badge.active {
    background: rgba(34, 197, 94, 0.2);
    color: #4ade80;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.1);
    animation: pulse-badge 2s infinite;
}

.shift-badge.completed {
    background: rgba(148, 163, 184, 0.2);
    color: #94a3b8;
}

.shift-badge.upcoming {
    background: rgba(59, 130, 246, 0.1);
    color: #60a5fa;
    opacity: 0.7;
    border: 1px dashed rgba(59, 130, 246, 0.3);
}

@keyframes pulse-badge {
    0% { opacity: 1; }
    50% { opacity: 0.7; }
    100% { opacity: 1; }
}

.pl-6 { padding-left: 5rem; }

.highlight { color: white; font-weight: 700; }
.text-center { text-align: center; }
.text-left { text-align: center; }
.text-right { text-align: center; }
.text-yellow { color: #facc15; }
.text-blue { color: #60a5fa; }
.text-green { color: #4ade80; }
</style>
