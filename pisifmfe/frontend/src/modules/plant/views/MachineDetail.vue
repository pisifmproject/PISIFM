<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS } from '@/config/app.config';
import { ArrowLeft, Zap, Cloud, Droplet, Wind, Activity, Timer, Wrench, Package } from 'lucide-vue-next';

// Charts
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { LineChart, GaugeChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
} from "echarts/components";
import VChart from "vue-echarts";

use([
  CanvasRenderer,
  LineChart,
  GaugeChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent
]);

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as string);
const machineId = computed(() => route.params.machineId as string);
const plantConfig = computed(() => PLANTS[plantId.value as keyof typeof PLANTS] || PLANTS['cikupa']);

const machineName = computed(() => {
    return plantConfig.value.machines.find(m => m.id === machineId.value)?.name || machineId.value;
});

// Menus
const TABS = ['PERFORMANCE', 'PROCESS', 'PACKING', 'UTILITY', 'ALARMS', 'DOWNTIME', 'MAINTENANCE'];
const activeTab = ref('PERFORMANCE');

// Dummy Data Generators based on Machine ID hash/random
const getRandom = (min: number, max: number) => Math.random() * (max - min) + min;

// --- Performance Tab Data ---
const oee = ref(Math.floor(getRandom(70, 90)));
const availability = ref(Math.floor(getRandom(80, 95)));
const performance = ref(Math.floor(getRandom(85, 98)));
const quality = ref(Math.floor(getRandom(95, 99.9)));
const volume = ref(Math.floor(getRandom(2000, 5000)));
const targetVolume = 8000;
const runRate = ref(Math.floor(getRandom(400, 600)));
const rejectRate = ref(getRandom(0.5, 3.5));

// --- Utility Tab Data ---
const utilityData = ref({
    electricity: getRandom(4000, 6000),
    steam: getRandom(0, 100), // Some machines might not use steam
    water: getRandom(10, 50),
    air: getRandom(5000, 7000)
});

// --- Process Tab Data (Mimicking Image 2) ---
const processData = ref({
    mode: 'NORMAL MODE',
    status: '1.94',
    // Col 1: Prep / Slicing
    feedFromCrates: 'ON',
    peelerStatus: 'ACTIVE',
    potatoPrepStatus: 'AUTO',
    slicersStatus: 'AUTO',
    washerDrivesStatus: 'AUTO',
    potatoFeedStatus: 'ON',
    slicersIncline: getRandom(22.5, 23.5),
    headTemp: Math.floor(getRandom(38, 40)),
    peelerRpm: Math.floor(getRandom(1400, 1500)),
    peelerLoad: Math.floor(getRandom(70, 85)),
    washerLevel: Math.floor(getRandom(80, 90)),
    washerFlow: getRandom(11.5, 13.5),
    
    // Col 2: Oil & Fryer
    oilCirc: getRandom(4300, 4400),
    fryerInlet: getRandom(177.5, 178.5),
    fryerOutlet: getRandom(153.5, 154.5),
    burnerOutput: getRandom(43, 44),
    oilLevel: Math.floor(getRandom(145, 150)),
    usedOil: 0,
    newOil: 100,

    // Col 3: Moisture / Drives / Quality
    moisture: getRandom(1.90, 1.98),
    actualOil: getRandom(26.5, 27.5),
    masterSpeed: getRandom(69.5, 70.5),
    paddleSpeed: 41,
    submergerSpeed: 51,
    takeoutSpeed: 45,
    fryerOutfeed: 'AUTO',
    takeoutConv: 'ON',
    postFryer: 'AUTO',
    sliceThick: 1.750,
    potatoSolids: 20.0
});

// --- Chart Options ---
const oeeChartOption = ref({
    backgroundColor: 'transparent',
    tooltip: { trigger: 'axis' },
    grid: { left: 0, right: 0, top: 0, bottom: 0 },
    xAxis: { show: false, type: 'category', data: ['1', '2', '3', '4', '5', '6', '7'] },
    yAxis: { show: false, type: 'value', min: 50 },
    series: [{
        type: 'line',
        smooth: true,
        data: [70, 75, 72, 78, 77, 82, 80],
        lineStyle: { width: 4, color: '#3b82f6' },
        areaStyle: {
            opacity: 0.1,
            color: '#3b82f6'
        },
        symbol: 'none'
    }]
});

// Navigation
function goBack() {
    router.push(`/plant/${plantId.value}/production`);
}

function formatNumber(num: number, dec = 0) {
    return num.toLocaleString('id-ID', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

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
                <div class="flex items-center gap-3">
                    <h1 class="machine-title">{{ machineName.toUpperCase() }}</h1>
                    <span class="status-badge">RUNNING</span>
                </div>
                <p class="subtitle">{{ plantConfig.name.toUpperCase() }} - PACKING INFRASTRUCTURE</p>
            </div>
        </div>
    </div>

    <!-- Navigation Tabs -->
    <div class="tabs-nav">
        <button 
            v-for="tab in TABS" 
            :key="tab"
            class="tab-btn"
            :class="{ active: activeTab === tab }"
            @click="activeTab = tab"
        >
            {{ tab }}
        </button>
    </div>

    <!-- Tab Content -->
    <div class="content-area">
        
        <!-- PERFORMANCE TAB -->
        <div v-if="activeTab === 'PERFORMANCE'" class="grid grid-cols-1 lg:grid-cols-2 gap-6 fade-in">
            <!-- OEE Card -->
            <div class="card p-6 relative overflow-hidden">
                <div class="flex justify-between items-start z-10 relative">
                    <div>
                        <div class="card-label">OVERALL EQUIPMENT EFFECTIVENESS</div>
                        <div class="flex items-center gap-3 mt-1">
                            <span class="text-6xl font-bold text-yellow-400">{{ oee }}%</span>
                            <span class="text-xs px-2 py-1 border border-gray-600 rounded text-gray-400">ISO 22400-2</span>
                        </div>
                    </div>
                </div>
                
                <!-- Mini Chart Background -->
                <div class="absolute right-0 top-6 w-1/3 h-24 opacity-30">
                     <v-chart class="chart" :option="oeeChartOption" autoresize />
                </div>

                <div class="grid grid-cols-3 gap-4 mt-12 pt-6 border-t border-gray-700/50">
                    <div>
                        <div class="sub-label">AVAILABILITY</div>
                        <div class="sub-val text-blue-400">{{ availability }}%</div>
                    </div>
                    <div>
                        <div class="sub-label">PERFORMANCE</div>
                        <div class="sub-val text-purple-400">{{ performance }}%</div>
                    </div>
                    <div>
                        <div class="sub-label">QUALITY</div>
                        <div class="sub-val text-green-400">{{ quality }}%</div>
                    </div>
                </div>
            </div>

            <!-- Volume Production -->
            <div class="card p-6">
                <div class="flex justify-between">
                    <div class="flex items-center gap-2">
                         <Package class="w-4 h-4 text-gray-400" />
                         <span class="card-label">PRODUCTION VOLUME</span>
                    </div>
                    <div class="text-right">
                        <div class="card-label">Target: {{ formatNumber(targetVolume) }} kg</div>
                    </div>
                </div>

                <div class="mt-4">
                    <div class="text-5xl font-bold text-white">{{ formatNumber(volume) }}</div>
                </div>

                <!-- Progress Bar -->
                <div class="mt-6 mb-2">
                    <div class="w-full h-3 bg-gray-700 rounded-full overflow-hidden">
                        <div class="h-full bg-yellow-500 rounded-full" :style="{ width: (volume/targetVolume*100) + '%' }"></div>
                    </div>
                    <div class="text-right text-xs text-yellow-500 mt-1 font-bold">{{ (volume/targetVolume*100).toFixed(1) }}% Attainment</div>
                </div>

                <div class="grid grid-cols-2 gap-4 mt-6">
                     <div class="bg-gray-800/50 p-3 rounded border border-gray-700">
                        <div class="sub-label">RUN RATE</div>
                        <div class="text-xl font-bold text-white">{{ runRate }} <small class="text-gray-400">kg/h</small></div>
                     </div>
                     <div class="bg-gray-800/50 p-3 rounded border border-gray-700">
                        <div class="sub-label">REJECT RATE</div>
                        <div class="text-xl font-bold text-red-400">{{ formatNumber(rejectRate, 2) }}%</div>
                     </div>
                </div>
            </div>
        </div>

        <!-- PROCESS TAB -->
        <div v-else-if="activeTab === 'PROCESS'" class="grid grid-cols-1 lg:grid-cols-3 gap-4 fade-in">
             <!-- Header Strip -->
             <div class="lg:col-span-3 card p-4 flex justify-between items-center bg-gray-900 border border-teal-900/50 shadow-lg">
                 <div>
                     <span class="text-xs text-gray-400 uppercase tracking-widest block mb-1">PRODUCT</span>
                     <span class="text-2xl font-black text-white tracking-wide">WAVY</span>
                 </div>
                 <div class="flex flex-col items-center">
                     <span class="px-6 py-1.5 bg-teal-900/20 text-teal-400 border border-teal-500/30 rounded-full text-xs font-bold uppercase tracking-wider shadow-[0_0_10px_rgba(45,212,191,0.1)]">{{ processData.mode }}</span>
                     <span class="text-[0.65rem] text-teal-500 mt-1.5 font-semibold tracking-wider">● PLC COMMS OK</span>
                 </div>
                 <div class="text-right">
                     <span class="text-xs text-gray-400 uppercase tracking-widest block mb-1">STATUS</span>
                     <span class="text-2xl font-black text-blue-400 tracking-wide">{{ processData.status }}</span>
                 </div>
             </div>

             <!-- COL 1: PREP / SLICING -->
             <div class="flex flex-col gap-4">
                 <div class="card p-5 border-l-4 border-l-teal-500 h-full relative overflow-hidden">
                     <div class="section-head text-teal-400 mb-5 font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                         <Package class="w-4 h-4" /> PREP / SLICING SYSTEMS
                     </div>
                     
                     <!-- Feed From Crates -->
                     <div class="mb-4">
                         <div class="label-xs mb-1">FEED FROM CRATES</div>
                         <div class="control-panel flex justify-between items-center">
                             <div class="text-green-400 font-bold text-lg">{{ processData.feedFromCrates }}</div>
                             <span class="badge-on shadow-green-900/20">ON</span>
                         </div>
                     </div>

                     <!-- Peeler / Potato Prep -->
                     <div class="grid grid-cols-2 gap-3 mb-4">
                         <div>
                             <div class="label-xs mb-1">PEELER</div>
                             <div class="control-panel text-green-400 font-bold flex justify-between items-center">
                                 {{ processData.peelerStatus }}
                                 <div class="flex gap-1.5"><div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div><div class="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]"></div></div>
                             </div>
                         </div>
                         <div>
                             <div class="label-xs mb-1">POTATO PREP</div>
                             <div class="control-panel text-blue-400 font-bold flex justify-between">
                                 {{ processData.potatoPrepStatus }}
                                 <span class="badge-auto">AUTO</span>
                             </div>
                         </div>
                     </div>

                     <!-- Slicers / Washer -->
                     <div class="grid grid-cols-2 gap-3 mb-4">
                         <div>
                             <div class="label-xs mb-1">SLICERS</div>
                             <div class="control-panel text-blue-400 font-bold flex justify-between">
                                 {{ processData.slicersStatus }}
                                 <span class="badge-auto">AUTO</span>
                             </div>
                         </div>
                         <div>
                             <div class="label-xs mb-1">WASHER DRIVES</div>
                             <div class="control-panel text-blue-400 font-bold flex justify-between">
                                 {{ processData.washerDrivesStatus }}
                                 <span class="badge-auto">AUTO</span>
                             </div>
                         </div>
                     </div>

                     <!-- Potato Feed -->
                     <div class="mb-4">
                         <div class="label-xs mb-1">POTATO FEED</div>
                         <div class="control-panel flex justify-between items-center">
                             <div class="text-green-400 font-bold">{{ processData.potatoFeedStatus }} <small class="text-gray-500 font-normal ml-1 text-xs">(to Slicers)</small></div>
                             <span class="badge-enabled">ENABLED</span>
                         </div>
                     </div>
                    
                     <!-- Slicers Incline -->
                     <div class="mb-5">
                         <div class="label-xs mb-1">SLICERS INCLINE</div>
                         <div class="text-2xl font-bold text-white mb-1">{{ processData.slicersIncline.toFixed(1) }} <small class="text-sm text-gray-400 font-normal">%</small></div>
                         <div class="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden border border-gray-700"><div class="h-full bg-teal-500 shadow-[0_0_10px_rgba(20,184,166,0.5)]" style="width: 23%"></div></div>
                     </div>

                     <!-- Slicer Gates -->
                     <div class="mb-5">
                         <div class="label-xs mb-2">SLICER GATES</div>
                         <div class="grid grid-cols-4 gap-2">
                             <div v-for="i in 4" :key="i" class="text-center py-2 bg-gradient-to-b from-gray-800 to-gray-900 text-teal-400 border border-teal-500/20 rounded shadow-sm text-sm font-bold cursor-default hover:border-teal-500/50 transition-colors">{{ i }}</div>
                         </div>
                     </div>

                     <!-- Head Temp -->
                     <div class="mb-5">
                         <div class="label-xs mb-1">HEAD TEMP</div>
                         <div class="text-2xl font-bold text-orange-400">{{ processData.headTemp }} <small class="text-xs text-gray-500 font-medium">DEG</small></div>
                     </div>

                     <!-- Filled Empty Space: New System Metrics -->
                     <div class="mt-auto pt-4 border-t border-gray-700/50">
                        <div class="label-xs mb-3 text-teal-500">SYSTEM PARAMETERS</div>
                        <div class="grid grid-cols-2 gap-3 mb-3">
                             <div class="control-panel">
                                 <div class="label-xs mb-1">PEELER RPM</div>
                                 <div class="val-lg text-white">{{ processData.peelerRpm }}</div>
                             </div>
                             <div class="control-panel">
                                 <div class="label-xs mb-1">PEELER LOAD</div>
                                 <div class="val-lg text-purple-400">{{ processData.peelerLoad }}<small class="unit">%</small></div>
                             </div>
                        </div>
                        <div class="grid grid-cols-2 gap-3">
                             <div class="control-panel">
                                 <div class="label-xs mb-1">WASHER LVL</div>
                                 <div class="val-lg text-blue-400">{{ processData.washerLevel }}<small class="unit">%</small></div>
                             </div>
                             <div class="control-panel">
                                 <div class="label-xs mb-1">WASHER FLOW</div>
                                 <div class="val-lg text-blue-300">{{ formatNumber(processData.washerFlow, 1) }}<small class="unit">m³/h</small></div>
                             </div>
                        </div>
                     </div>
                 </div>
             </div>

             <!-- COL 2: OIL / FRYER -->
             <div class="flex flex-col gap-4">
                 <!-- Oil Flow Control -->
                 <div class="card p-5 border-l-4 border-l-teal-500">
                     <div class="section-head text-teal-400 mb-5 font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                         <Activity class="w-4 h-4" /> OIL FLOW CONTROL
                     </div>
                     <div class="control-panel flex justify-between items-center mb-4">
                         <div>
                             <div class="label-xs mb-1">MAIN OIL CIRC</div>
                             <div class="val-xl text-blue-300">{{ formatNumber(processData.oilCirc) }} <small class="unit">L/M</small></div>
                         </div>
                         <div class="text-right">
                             <span class="badge-auto block mb-1">AUTO</span>
                             <div class="text-[0.65rem] text-gray-500 font-mono">Ctrl: 97</div>
                         </div>
                     </div>
                 </div>

                 <!-- Fryer Temp -->
                 <div class="card p-5 border-l-4 border-l-yellow-500">
                     <div class="section-head text-yellow-400 mb-5 font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                         <div class="w-1 h-3 bg-yellow-500"></div> FRYER INLET TEMP CONTROL
                     </div>
                     
                     <div class="control-panel flex justify-between items-center mb-4">
                         <div>
                             <div class="label-xs mb-1">FRYER INLET</div>
                             <div class="val-xl text-yellow-500">{{ formatNumber(processData.fryerInlet, 1) }} <small class="unit">°C</small></div>
                             <div class="text-[0.65rem] text-gray-500 font-mono mt-1">SETPOINT: 178.0</div>
                         </div>
                         <span class="badge-auto self-start">AUTO</span>
                     </div>
                     
                     <div class="control-panel mb-4">
                         <div>
                             <div class="label-xs mb-1">FRYER OUTLET</div>
                             <div class="val-xl text-blue-300">{{ formatNumber(processData.fryerOutlet, 1) }} <small class="unit">°C</small></div>
                         </div>
                     </div>

                     <div class="grid grid-cols-2 gap-4">
                         <div>
                             <div class="label-xs mb-1">DELTA T</div>
                             <div class="text-xl font-bold text-white">{{ (processData.fryerInlet - processData.fryerOutlet).toFixed(1) }} <small class="text-gray-400 text-sm">°C</small></div>
                         </div>
                         <div>
                             <div class="label-xs mb-1">BURNER OUTPUT</div>
                             <div class="text-xl font-bold text-red-400">{{ processData.burnerOutput.toFixed(1) }} <small class="text-gray-400 text-sm">%</small></div>
                         </div>
                     </div>
                 </div>

                 <!-- Oil Make-up -->
                 <div class="card p-5 border-l-4 border-l-green-500">
                     <div class="section-head text-green-400 mb-5 font-bold uppercase tracking-wider text-sm flex items-center gap-2">
                        <Droplet class="w-4 h-4" /> OIL MAKE-UP
                     </div>
                     <div class="grid grid-cols-2 gap-4 mb-4">
                         <div class="control-panel">
                            <div class="label-xs mb-1">USED OIL %</div>
                            <div class="text-white font-bold text-lg">{{ processData.usedOil }}</div>
                         </div>
                          <div class="control-panel">
                            <div class="label-xs mb-1">NEW OIL %</div>
                            <div class="text-green-400 font-bold text-lg">{{ processData.newOil }}</div>
                         </div>
                     </div>
                     <div class="control-panel flex justify-between items-center">
                         <div>
                              <div class="label-xs mb-1">OIL LEVEL</div>
                              <div class="val-xl text-green-300">{{ processData.oilLevel }} <small class="unit">MM</small></div>
                         </div>
                         <span class="badge-on uppercase tracking-wider">FRESH</span>
                     </div>
                     <div class="mt-4 text-right">
                         <div class="label-xs mb-1">VALVE OUTPUT</div>
                         <div class="flex justify-between items-center control-panel">
                             <div class="text-blue-400 font-bold text-lg">54.5 %</div>
                             <span class="badge-auto">AUTO</span>
                         </div>
                     </div>
                 </div>
             </div>

             <!-- COL 3: MOISTURE / SYSTEMS -->
             <div class="flex flex-col gap-4">
                 <!-- Moisture Control -->
                 <div class="card p-5 border-l-4 border-l-blue-500">
                     <div class="section-head text-blue-400 mb-5 font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                         <Cloud class="w-4 h-4" /> MOISTURE CONTROL
                     </div>
                     <div class="control-panel flex justify-between items-center mb-4">
                         <div>
                             <div class="label-xs mb-1">ACTUAL MOISTURE</div>
                             <div class="val-xl text-white">{{ formatNumber(processData.moisture, 2) }} <small class="unit">%</small></div>
                             <div class="text-[0.65rem] text-gray-500 font-mono mt-1">SETPOINT: 1.35</div>
                         </div>
                         <span class="badge-enabled self-start">ENABLED</span>
                     </div>

                     <div class="control-panel">
                         <div>
                             <div class="label-xs mb-1">ACTUAL OIL</div>
                             <div class="val-xl text-yellow-500">{{ formatNumber(processData.actualOil, 1) }} <small class="unit">%</small></div>
                              <div class="text-[0.65rem] text-gray-500 font-mono mt-1">SETPOINT: 35.0</div>
                         </div>
                     </div>
                 </div>

                 <!-- Drives -->
                 <div class="card p-5 border-l-4 border-l-purple-500">
                     <div class="section-head text-purple-400 mb-5 font-bold uppercase tracking-wider text-sm">OTHER SYSTEMS / DRIVES</div>
                     
                     <div class="control-panel flex justify-between items-center mb-4">
                         <div>
                             <div class="label-xs mb-1">MASTER SPEED</div>
                             <div class="val-xl text-green-400">{{ formatNumber(processData.masterSpeed, 1) }} <small class="unit">%</small></div>
                         </div>
                         <div class="text-right">
                             <span class="badge-auto block mb-1">AUTO</span>
                             <div class="text-[0.65rem] text-gray-500 font-mono">Lin: 70/64</div>
                         </div>
                     </div>

                     <div class="grid grid-cols-3 gap-2 mb-4 text-center">
                         <div class="control-panel px-2">
                             <div class="label-xs mb-1">PADDLE</div>
                             <div class="font-bold text-white text-lg">{{ processData.paddleSpeed }}%</div>
                         </div>
                         <div class="control-panel px-2">
                             <div class="label-xs mb-1">SUBMERGER</div>
                             <div class="font-bold text-white text-lg">{{ processData.submergerSpeed }}%</div>
                         </div>
                         <div class="control-panel px-2">
                             <div class="label-xs mb-1">TAKE-OUT</div>
                             <div class="font-bold text-white text-lg">{{ processData.takeoutSpeed }}%</div>
                         </div>
                     </div>

                     <div class="grid grid-cols-2 gap-3 mb-4">
                         <div>
                             <div class="label-xs mb-1">FRYER OUTFEED</div>
                             <div class="control-panel flex justify-between items-center text-blue-400 font-bold">
                                 {{ processData.fryerOutfeed }} <span class="badge-auto">AUTO</span>
                             </div>
                         </div>
                          <div>
                             <div class="label-xs mb-1">TAKE-OUT CONV</div>
                             <div class="control-panel flex justify-between items-center text-green-400 font-bold">
                                 {{ processData.takeoutConv }} <span class="badge-enabled">ENABLED</span>
                             </div>
                         </div>
                     </div>

                     <div class="mb-2">
                         <div class="label-xs mb-1">POST FRYER</div>
                          <div class="control-panel flex justify-between items-center text-blue-400 font-bold">
                                 {{ processData.postFryer }} <span class="badge-auto">AUTO</span>
                             </div>
                     </div>
                 </div>

                 <!-- Quality Specs -->
                 <div class="card p-5 border-l-4 border-l-indigo-500">
                     <div class="section-head text-indigo-400 mb-5 font-bold flex items-center gap-2 uppercase tracking-wider text-sm">
                         <Package class="w-4 h-4" /> QUALITY SPECS
                     </div>
                     <div class="grid grid-cols-2 gap-4">
                         <div class="control-panel">
                             <div class="label-xs mb-1">SLICE THICK</div>
                             <div class="text-2xl font-bold text-white">{{ processData.sliceThick.toFixed(3) }}</div>
                         </div>
                         <div class="control-panel">
                             <div class="label-xs mb-1">POTATO SOLIDS</div>
                             <div class="text-2xl font-bold text-white">{{ processData.potatoSolids.toFixed(1) }}%</div>
                         </div>
                     </div>
                 </div>
             </div>

        </div>

        <!-- UTILITY TAB -->
        <div v-else-if="activeTab === 'UTILITY'" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 fade-in">
             <!-- Electricity -->
             <div class="card p-5 border-l-4 border-blue-500 bg-gradient-to-br from-gray-900 to-blue-900/20">
                 <div class="flex justify-between items-start mb-4">
                     <span class="card-label text-blue-400">ELECTRICITY</span>
                     <Zap class="w-5 h-5 text-yellow-400" />
                 </div>
                 <div class="text-3xl font-bold text-white">{{ formatNumber(utilityData.electricity, 2) }} <small class="text-sm font-normal text-gray-400">kWh</small></div>
             </div>
             
             <!-- Steam -->
             <div class="card p-5 border-l-4 border-gray-400 bg-gradient-to-br from-gray-900 to-gray-800/40">
                 <div class="flex justify-between items-start mb-4">
                     <span class="card-label text-gray-300">STEAM</span>
                     <Cloud class="w-5 h-5 text-gray-300" />
                 </div>
                 <div class="text-3xl font-bold text-white">{{ formatNumber(utilityData.steam) }} <small class="text-sm font-normal text-gray-400">kg</small></div>
             </div>

             <!-- Water -->
             <div class="card p-5 border-l-4 border-cyan-500 bg-gradient-to-br from-gray-900 to-cyan-900/20">
                 <div class="flex justify-between items-start mb-4">
                     <span class="card-label text-cyan-400">WATER</span>
                     <Droplet class="w-5 h-5 text-cyan-400" />
                 </div>
                 <div class="text-3xl font-bold text-white">{{ formatNumber(utilityData.water, 2) }} <small class="text-sm font-normal text-gray-400">m³</small></div>
             </div>

             <!-- Air -->
             <div class="card p-5 border-l-4 border-teal-500 bg-gradient-to-br from-gray-900 to-teal-900/20">
                 <div class="flex justify-between items-start mb-4">
                     <span class="card-label text-teal-400">AIR</span>
                     <Wind class="w-5 h-5 text-teal-400" />
                 </div>
                 <div class="text-3xl font-bold text-white">{{ formatNumber(utilityData.air, 2) }} <small class="text-sm font-normal text-gray-400">Nm³</small></div>
             </div>
        </div>

        <!-- COMING SOON TABS -->
        <div v-else class="flex flex-col items-center justify-center h-[400px] text-center fade-in card p-10">
            <template v-if="activeTab === 'PACKING'">
                <Package class="w-16 h-16 text-gray-600 mb-4" />
                <h2 class="text-2xl font-bold text-gray-300">Packing Module</h2>
            </template>
            <template v-if="activeTab === 'ALARMS'">
                <Activity class="w-16 h-16 text-gray-600 mb-4" />
                <h2 class="text-2xl font-bold text-gray-300">Alarms History</h2>
            </template>
            <template v-if="activeTab === 'DOWNTIME'">
                <Timer class="w-16 h-16 text-gray-600 mb-4" />
                <h2 class="text-2xl font-bold text-gray-300">Downtime Analysis</h2>
            </template>
             <template v-if="activeTab === 'MAINTENANCE'">
                <Wrench class="w-16 h-16 text-gray-600 mb-4" />
                <h2 class="text-2xl font-bold text-gray-300">Maintenance Schedule</h2>
            </template>
            
            <p class="text-gray-500 mt-2">This module is under development and will be available soon.</p>
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
.header-section { margin-bottom: 1.5rem; }
.machine-title { font-size: 1.5rem; font-weight: 800; color: white; letter-spacing: 0.05em; }
.status-badge { background: rgba(16, 185, 129, 0.2); color: #10b981; border: 1px solid rgba(16, 185, 129, 0.3); padding: 0.1rem 0.5rem; border-radius: 4px; font-size: 0.7rem; font-weight: 700; }
.subtitle { color: #64748b; font-size: 0.75rem; font-weight: 700; letter-spacing: 0.05em; margin-top: 0.1rem; }
.back-btn { background: transparent; border: none; color: #94a3b8; padding: 0.5rem; border-radius: 50%; cursor: pointer; transition: all 0.2s; }
.back-btn:hover { background: rgba(255,255,255,0.1); color: white; }

/* Tabs */
.tabs-nav {
    display: flex; gap: 2rem; border-bottom: 2px solid #1e293b; margin-bottom: 2rem; padding-bottom: 0.5rem;
    overflow-x: auto;
}
.tab-btn {
    background: transparent; border: none; color: #64748b; font-size: 0.8rem; font-weight: 700; cursor: pointer; text-transform: uppercase; padding-bottom: 0.5rem; position: relative;
    transition: all 0.2s; white-space: nowrap;
}
.tab-btn:hover { color: #94a3b8; }
.tab-btn.active { color: #3b82f6; }
.tab-btn.active::after {
    content: ''; position: absolute; bottom: -0.65rem; left: 0; width: 100%; height: 3px; background: #3b82f6;
}

/* Common */
.card { 
    background: #1e293b; 
    border-radius: 8px; 
    border: 1px solid rgba(148, 163, 184, 0.1);
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}
.control-panel {
    background: rgba(15, 23, 42, 0.5); 
    border: 1px solid rgba(255, 255, 255, 0.05);
    border-radius: 6px;
    padding: 0.75rem;
}
.card-label { font-size: 0.75rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.sub-label { font-size: 0.65rem; color: #64748b; font-weight: 700; margin-bottom: 0.1rem; }
.sub-val { font-size: 1.25rem; font-weight: 700; }

/* Process Styles */
.label-xs { font-size: 0.65rem; color: #94a3b8; font-weight: 700; letter-spacing: 0.05em; text-transform: uppercase; }
.val-lg { font-size: 1.25rem; font-weight: 700; letter-spacing: -0.025em; }
.val-xl { font-size: 1.5rem; font-weight: 700; letter-spacing: -0.025em; font-family: 'Inter', monospace; }
.unit { font-size: 0.75rem; color: #64748b; font-weight: 500; font-family: 'Inter', sans-serif; }

.badge-auto { background: rgba(15, 118, 110, 0.1); color: #2dd4bf; border: 1px solid rgba(15, 118, 110, 0.3); padding: 0.1rem 0.4rem; font-size: 0.6rem; border-radius: 3px; font-weight: 700; letter-spacing: 0.05em; }
.badge-enabled { background: rgba(37, 99, 235, 0.1); color: #60a5fa; border: 1px solid rgba(37, 99, 235, 0.3); padding: 0.1rem 0.4rem; font-size: 0.6rem; border-radius: 3px; font-weight: 700; letter-spacing: 0.05em; }
.badge-on { background: rgba(22, 163, 74, 0.1); color: #4ade80; border: 1px solid rgba(22, 163, 74, 0.3); padding: 0.1rem 0.4rem; font-size: 0.6rem; border-radius: 3px; font-weight: 700; letter-spacing: 0.05em; }

.fade-in { animation: fadeIn 0.3s ease-in; }
@keyframes fadeIn { from { opacity: 0; transform: translateY(5px); } to { opacity: 1; transform: translateY(0); } }

.chart { width: 100%; height: 100%; }
</style>
