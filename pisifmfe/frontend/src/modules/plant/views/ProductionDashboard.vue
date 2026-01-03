<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { 
    Activity,
    Box,
    AlertCircle,
    LayoutGrid,
    ArrowLeft,
    TrendingUp,
    ChevronRight,
    Circle
} from 'lucide-vue-next';

// Charts
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  BarChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as string);
const plantConfig = computed(() => PLANTS[plantId.value as keyof typeof PLANTS] || PLANTS['cikupa']);

// Types
type Period = 'Day' | 'Week' | 'Month' | 'Year';
const PERIODS: Period[] = ['Day', 'Week', 'Month', 'Year'];
const selectedPeriod = ref<Period>('Day');

// Computed Machines based on Plant
const machines = computed(() => {
    return (plantConfig.value.machines || []).map(m => {
        // Generate consistent dummy stats
        const isRunning = m.id.length % 5 !== 0; 
        const efficiency = isRunning ? (Math.random() * 20 + 75) : 0;
        const output = isRunning ? Math.floor(Math.random() * 5000 + 2000) : 0;
        
        return {
            id: m.id,
            name: m.name,
            output: output,
            efficiency: efficiency,
            status: isRunning ? 'RUNNING' : 'STOPPED',
        };
    }).sort((a,b) => b.efficiency - a.efficiency); // Sort by efficiency for "Top Performers"
});

const topPerformers = computed(() => machines.value.slice(0, 5));

// Metrics
const plantOee = ref(75.4);
const totalOutput = computed(() => machines.value.reduce((acc, m) => acc + m.output, 0));
const breakdowns = ref(0);
const activeLines = computed(() => machines.value.filter(m => m.status === 'RUNNING').length);

// Chart Option (OEE Factor Decomposition)
const chartOption = ref({
    backgroundColor: 'transparent',
    grid: { left: '3%', right: '4%', bottom: '3%', top: '3%', containLabel: true },
    xAxis: {
        type: 'value',
        splitLine: { lineStyle: { color: '#334155', type: 'dashed' } },
        axisLabel: { color: '#94a3b8' },
        max: 100
    },
    yAxis: {
        type: 'category',
        data: ['Quality', 'Performance', 'Availability'],
        axisLabel: { color: '#cbd5e1', fontWeight: 'bold' },
        axisLine: { show: false },
        axisTick: { show: false }
    },
    series: [
        {
            type: 'bar',
            data: [
                { value: 98.5, itemStyle: { color: '#10b981' } }, // Green
                { value: 89.2, itemStyle: { color: '#8b5cf6' } }, // Purple
                { value: 92.4, itemStyle: { color: '#3b82f6' } }  // Blue
            ],
            barWidth: '25%',
            label: { show: false }
        }
    ]
});

// Navigation
function goBack() {
    router.push(`/plant/${plantId.value}`);
}

function navigateToMachine(machineId: string) {
    router.push({
        name: 'MachineDetailPerformance',
        params: {
            plantId: plantId.value,
            machineId: machineId
        }
    });
}

const formatNumber = (num: number) => {
    return num.toLocaleString('id-ID');
};

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
                    <h1 class="title">Production Summary</h1>
                </div>
                <!-- Removed 'Production Summary' from subtitle as requested, just Plant Name -->
                <p class="subtitle">{{ plantConfig.name }}</p> 
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

    <!-- Metrics Cards -->
    <div class="metrics-row">
        <!-- Plant OEE -->
        <div class="metric-card">
            <div class="mc-top">
                <span class="mc-label">PLANT OEE</span>
                <div class="mc-icon w-8 h-8 flex items-center justify-center rounded-lg bg-green-500/10 text-green-500">
                    <Activity class="w-5 h-5" />
                </div>
            </div>
            <div class="mc-val text-green-400">{{ plantOee.toFixed(1).replace('.', ',') }}<small>%</small></div>
            <div class="mc-sub text-green-500">↗ +1.2% vs prev period</div>
        </div>

        <!-- Total Output -->
        <div class="metric-card">
            <div class="mc-top">
                <span class="mc-label">TOTAL OUTPUT</span>
                <div class="mc-icon w-8 h-8 flex items-center justify-center rounded-lg bg-blue-500/10 text-blue-500">
                    <Box class="w-5 h-5" />
                </div>
            </div>
            <div class="mc-val text-blue-400">{{ formatNumber(totalOutput) }} <small class="text-sm">kg</small></div>
            <div class="mc-sub text-blue-500">↗ +4.5% vs prev period</div>
        </div>

        <!-- Breakdowns -->
        <div class="metric-card">
             <div class="mc-top">
                <span class="mc-label">BREAKDOWNS</span>
                <div class="mc-icon w-8 h-8 flex items-center justify-center rounded-lg bg-red-500/10 text-red-500">
                    <AlertCircle class="w-5 h-5" />
                </div>
            </div>
            <div class="mc-val text-gray-200">{{ breakdowns }} <small class="text-sm">Units</small></div>
        </div>

        <!-- Active Lines -->
        <div class="metric-card">
             <div class="mc-top">
                <span class="mc-label">ACTIVE LINES</span>
                <div class="mc-icon w-8 h-8 flex items-center justify-center rounded-lg bg-teal-500/10 text-teal-500">
                    <LayoutGrid class="w-5 h-5" />
                </div>
            </div>
            <div class="mc-val text-teal-400">
                {{ activeLines }}<span class="text-gray-500 text-lg">/{{ machines.length }}</span>
            </div>
        </div>
    </div>

    <!-- Main Content Area -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <!-- OEE Factor Decomposition Chart -->
        <div class="card p-6 lg:col-span-2">
            <div class="card-header mb-4 flex justify-between items-center">
                <div class="flex items-center gap-2">
                    <div class="w-2 h-2 rounded-full border border-blue-500"></div>
                    <h3 class="card-title">OEE FACTOR DECOMPOSITION</h3>
                </div>
                <span class="text-xs text-gray-500">ISO 22400-2 COMPLIANT</span>
            </div>
            <div class="h-[300px]">
                <v-chart class="chart" :option="chartOption" autoresize />
            </div>
        </div>

        <!-- Top Performers List -->
        <div class="card p-6">
            <div class="card-header mb-4 flex items-center gap-2">
                 <div class="w-2 h-2 rounded-full border border-green-500"></div>
                 <h3 class="card-title">TOP PERFORMERS</h3>
            </div>
            <div class="flex flex-col gap-3">
                <div v-for="(m, idx) in topPerformers" :key="m.id" class="performer-row">
                    <div class="rank">{{ (idx + 1).toString().padStart(2, '0') }}</div>
                    <div class="flex-1">
                        <div class="p-name">{{ m.name }}</div>
                        <div class="p-sub">{{ formatNumber(m.output) }} KG PRODUCED</div>
                    </div>
                    <div class="p-score text-green-400">{{ m.efficiency.toFixed(1).replace('.', ',') }}%</div>
                    <div class="w-12 h-1 bg-gray-700 rounded-full ml-2 overflow-hidden">
                        <div class="h-full bg-green-500" :style="{ width: m.efficiency + '%' }"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <!-- Asset Fleet Status (Machine List) -->
    <div class="section-title-row mb-4 flex items-center gap-2 border-l-4 border-blue-500 pl-3">
        <h2 class="text-lg font-bold text-white uppercase tracking-wider">Asset Fleet Status</h2>
    </div>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div 
            v-for="m in machines" 
            :key="m.id" 
            class="fleet-card"
            @click="navigateToMachine(m.id)"
        >
            <div class="fc-header">
                <div>
                    <div class="fc-name">{{ m.name.toUpperCase() }}</div>
                    <div class="fc-id text-gray-500">{{ m.id }}</div>
                </div>
                <span class="badge" :class="m.status === 'RUNNING' ? 'running' : 'stopped'">{{ m.status }}</span>
            </div>
            
            <div class="fc-stats mt-4">
                <div class="stat">
                    <div class="label">YIELD</div>
                    <div class="val">{{ formatNumber(m.output) }} <span class="unit">KG</span></div>
                </div>
                <div class="stat text-right">
                    <div class="label">PERFORMANCE</div>
                    <div class="val" :class="m.status === 'RUNNING' ? 'text-green-400' : 'text-gray-500'">
                        {{ m.efficiency.toFixed(1).replace('.', ',') }}%
                    </div>
                </div>
            </div>

            <div class="fc-footer mt-4 pt-3 border-t border-gray-700 flex justify-between items-center text-xs text-gray-500">
                <div class="flex items-center gap-1">
                    <div class="w-1.5 h-1.5 rounded-full" :class="m.status === 'RUNNING' ? 'bg-green-500' : 'bg-red-500'"></div>
                    LIVE DATA
                </div>
                <ChevronRight class="w-4 h-4" />
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
.title { font-size: 1.5rem; font-weight: 800; color: white; text-transform: uppercase; letter-spacing: 0.05em; }
.subtitle { color: #64748b; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; margin-top: 0.2rem; }
.back-btn { background: transparent; border: none; color: #94a3b8; padding: 0.5rem; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(255,255,255,0.1); color: white; }

.time-filters {
    background: #0f172a; border: 1px solid #1e293b; border-radius: 6px; padding: 0.25rem; display: flex; gap: 0.25rem;
}
.filter-btn {
    background: transparent; border: none; color: #64748b; padding: 0.4rem 1rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; cursor: pointer; transition: all 0.2s;
}
.filter-btn:hover { color: white; }
.filter-btn.active { background: #2563eb; color: white; }

/* Metrics Row */
.metrics-row {
    display: grid; grid-template-columns: repeat(auto-fit, minmax(240px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;
}
.metric-card {
    background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.5rem;
}
.mc-top { display: flex; justify-content: space-between; align-items: start; margin-bottom: 0.5rem; }
.mc-label { font-size: 0.7rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; }
.mc-val { font-size: 2rem; font-weight: 700; line-height: 1; margin-bottom: 0.25rem; }
.mc-sub { font-size: 0.75rem; font-weight: 600; }

/* Cards */
.card { background: #1e293b; border: 1px solid #334155; border-radius: 12px; }
.card-title { font-size: 0.9rem; font-weight: 700; color: white; letter-spacing: 0.05em; }
.chart { width: 100%; height: 100%; }

/* Performer Row */
.performer-row {
    display: flex; align-items: center; gap: 1rem; padding: 0.75rem; background: #0f172a; border: 1px solid #1e293b; border-radius: 8px;
}
.rank { font-size: 0.8rem; font-weight: 700; color: #475569; background: #1e293b; padding: 0.25rem 0.5rem; border-radius: 4px; }
.p-name { font-size: 0.9rem; font-weight: 700; color: white; }
.p-sub { font-size: 0.65rem; color: #64748b; font-weight: 600; text-transform: uppercase; }
.p-score { font-size: 0.9rem; font-weight: 700; margin-left: auto; }

/* Fleet Grid */
.fleet-card {
    background: #1e293b; border: 1px solid #334155; border-radius: 12px; padding: 1.25rem;
    cursor: pointer; transition: all 0.2s;
}
.fleet-card:hover { border-color: #3b82f6; background: rgba(59, 130, 246, 0.1); transform: translateY(-2px); }

.fc-header { display: flex; justify-content: space-between; align-items: start; }
.fc-name { font-size: 0.9rem; font-weight: 800; color: white; letter-spacing: 0.05em; }
.fc-id { font-size: 0.65rem; font-weight: 600; text-transform: uppercase; margin-top: 0.1rem; }

.badge { font-size: 0.6rem; padding: 0.2rem 0.6rem; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
.badge.running { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); }
.badge.stopped { background: rgba(239, 68, 68, 0.2); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); }

.fc-stats { display: flex; justify-content: space-between; }
.stat .label { font-size: 0.65rem; font-weight: 700; color: #64748b; letter-spacing: 0.05em; margin-bottom: 0.2rem; }
.stat .val { font-size: 1.1rem; font-weight: 700; color: white; }
.stat .unit { font-size: 0.7rem; color: #64748b; }

</style>
