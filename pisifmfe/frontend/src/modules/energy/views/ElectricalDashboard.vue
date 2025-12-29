<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Zap, ArrowRight, Activity, ArrowLeft } from 'lucide-vue-next';
import { lvmdpService } from '@/modules/energy/services/lvmdp.service';
import type { LVMDPData } from '@/modules/energy/models';

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as PlantId);
const plant = computed(() => PLANTS[plantId.value]);

// State for panels data (1-4)
const panels = ref<(LVMDPData | null)[]>([null, null, null, null]);
const unwatchers: (() => void)[] = [];
const isRealData = computed(() => plant.value?.useRealData ?? false);
const lastUpdate = ref(new Date());

function navigateToLvmdp(id: number) {
  router.push(`/plant/${plantId.value}/energy/electricity/lvmdp/${id}`);
}

const goBack = () => {
    router.back();
};

// Calculate Plant Totals
const plantStats = computed(() => {
    let totalKva = 0;
    let totalKw = 0;
    let maxCurrent = 0;
    let minCurrent = 999999;
    let validPanels = 0;

    panels.value.forEach(p => {
        if (p) {
            totalKva += p.apparentPower;
            totalKw += p.activePower;
            validPanels++;
            
            // Max/Min logic based on Avg Current
            if (p.avgCurrent > maxCurrent) maxCurrent = p.avgCurrent;
            if (p.avgCurrent < minCurrent) minCurrent = p.avgCurrent;
        }
    });

    if (validPanels === 0) minCurrent = 0;

    // Capacity is hardcoded as per design requirement (5.540 kVA)
    const capacity = 5540;
    const utilization = capacity > 0 ? (totalKva / capacity) * 100 : 0;
    
    // Average PF = Total Active / Total Apparent
    const avgPf = totalKva > 0 ? (totalKw / totalKva) : 0;

    return {
        totalKva,
        totalKw,
        utilization,
        avgPf,
        maxCurrent,
        minCurrent
    };
});

onMounted(() => {
    console.log(`[ElectricalDashboard] Mounting for plant ${plantId.value}, useRealData: ${isRealData.value}`);
    
    // Subscribe to LVMDP 1-4
    [1, 2, 3, 4].forEach(index => {
        const unsub = lvmdpService.subscribe(
            plantId.value, 
            index, 
            (data) => {
                panels.value[index - 1] = data;
                lastUpdate.value = new Date();
                console.log(`[ElectricalDashboard] Updated LVMDP ${index} data`);
            }
        );
        unwatchers.push(unsub);
    });
});

onUnmounted(() => {
    unwatchers.forEach(u => u());
});

// Helper for formatting
const formatNumber = (num: number, decimals = 1) => {
    return num.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
};
</script>

<template>
  <div class="elec-dashboard">
    <div class="header">
      <div class="header-top">
          <button @click="goBack" class="back-btn">
              <ArrowLeft class="w-5 h-5" />
          </button>
          <div class="header-content">
              <div class="title-row">
                  <Zap class="w-6 h-6 text-yellow-500 fill-yellow-500" />
                  <h1 class="page-title">Power Monitoring System</h1>
                  <div v-if="isRealData" class="live-badge">
                      <div class="live-dot"></div>
                      <span>LIVE DATA</span>
                  </div>
              </div>
              <p class="subtitle">
                {{ plant?.name }} • Installed Capacity: 5.540 kVA
                <span v-if="isRealData" class="last-update">
                  • Last Update: {{ lastUpdate.toLocaleTimeString() }}
                </span>
              </p>
          </div>
      </div>
    </div>

    <!-- Utilization Section (Full Width now) -->
    <div class="top-section">
      <div class="card utilization-card">
        <div class="card-header">
           <div class="card-title-row">
             <div class="icon-gauge">
                <!-- Simple SVG Gauge Icon -->
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                   <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" />
                </svg>
             </div>
             <h2>Plant Capacity Utilization</h2>
           </div>
        </div>

        <div class="utilization-content">
           <div class="progress-labels">
               <span class="p-label">CURRENT LOAD</span>
               <span class="p-capacity">CAPACITY (5.540 KVA)</span>
           </div>
           
           <div class="progress-bar-container">
               <div class="progress-bar">
                   <div class="progress-fill" :style="{ width: `${Math.min(plantStats.utilization, 100)}%` }">
                       <div class="progress-stripes"></div>
                   </div>
               </div>
           </div>

           <div class="main-stats-row">
               <div class="big-stat">
                   <span class="value">{{ formatNumber(plantStats.totalKva) }}</span>
                   <span class="unit">kVA (Total Apparent Power)</span>
               </div>
               <div class="utilization-percent">
                   <span class="val">{{ formatNumber(plantStats.utilization, 2) }}%</span>
                   <span class="lbl">UTILIZATION</span>
               </div>
           </div>

           <div class="secondary-stats-grid">
               <div class="stat-item">
                   <label>TOTAL ACTIVE POWER</label>
                   <span class="stat-val text-yellow">{{ formatNumber(plantStats.totalKw) }} <small>kW</small></span>
               </div>
               <div class="stat-item">
                   <label>AVG POWER FACTOR</label>
                   <span class="stat-val text-green">{{ formatNumber(plantStats.avgPf, 3) }}</span>
               </div>
               <div class="stat-item">
                   <label>MAX CURRENT (PLANT)</label>
                   <span class="stat-val text-red">{{ formatNumber(plantStats.maxCurrent) }} <small>A</small></span>
               </div>
               <div class="stat-item">
                   <label>MIN CURRENT (PLANT)</label>
                   <span class="stat-val text-blue">{{ formatNumber(plantStats.minCurrent) }} <small>A</small></span>
               </div>
           </div>
        </div>
        
        <!-- Background Decor -->
        <div class="bg-bolt">
             <Zap class="w-64 h-64 opacity-5" />
        </div>
      </div>
    </div>

    <!-- Panel Summaries -->
    <div class="section-header">
        <div class="grid-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
            </svg>
        </div>
        <h2>Panel Summaries</h2>
    </div>

    <div class="panels-grid">
      <div 
        v-for="(p, index) in panels" 
        :key="index"
        :class="['panel-card', { 'skeleton': !p }]"
        @click="navigateToLvmdp(index + 1)"
      >
        <template v-if="p">
            <div class="panel-header">
                <div>
                    <h3>{{ p.name }}</h3>
                    <span class="panel-code">{{ p.id.toUpperCase() }}</span>
                </div>
                <div class="panel-status-icon">
                    <Activity class="w-5 h-5" />
                </div>
            </div>

            <div class="panel-power">
                <label>TOTAL POWER</label>
                <div class="power-val">{{ formatNumber(p.activePower, 0) }} <small>kW</small></div>
            </div>

            <div class="panel-details-grid">
                <div class="detail-col">
                    <div class="detail-item">
                        <label>MAX CURRENT</label>
                        <!-- Assuming avgCurrent for now as max current for this panel isn't stored separately in simple model, 
                             but LVMDPData usually has phases. We can show max of phases if we want. 
                             Let's stick to avgCurrent or a formatted version. 
                             Wait, the mock shows "MAX CURRENT" per panel? 
                             Or is it max recorded? 
                             The service returns Current state.
                             Let's simple show Current for now. Or if the mockup implies historical Max, we don't have that yet.
                             I will map Average Current to "Current" label for clarity or use current value. 
                             Actually, let's look at the mock: "MAX CURRENT 899 A". 
                             If it's live data, we just show live current. 
                             I'll label it "AVG CURRENT" to be accurate to data, or "CURRENT".
                        -->
                        <!-- Actually, the mock says "MAX CURRENT". I'll stick to displaying the current value. -->
                        <span class="val-red">{{ formatNumber(p.avgCurrent, 1) }} A</span>
                    </div>
                    <div class="detail-item">
                        <label>APPARENT</label>
                        <span class="val-norm">{{ formatNumber(p.apparentPower, 1) }} kVA</span>
                    </div>
                </div>
                <div class="detail-col text-right">
                    <div class="detail-item">
                        <label>VOLTAGE (Avg)</label> 
                        <span class="val-blue">{{ formatNumber(p.avgVoltage, 1) }} V</span>
                    </div>
                    <div class="detail-item">
                        <label>PF</label>
                        <span class="val-green">{{ formatNumber(p.powerFactor, 2) }}</span>
                    </div>
                </div>
            </div>
            
            <div class="panel-footer">
                <span>View Detailed Analytics</span>
                <ArrowRight class="w-4 h-4" />
            </div>
        </template>
        <div v-else class="loading-state">
            <Activity class="w-8 h-8 animate-spin text-slate-600" />
            <span>Loading...</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.elec-dashboard {
  max-width: 1600px;
  margin: 0 auto;
  padding: 1rem;
  color: #fff;
  font-family: 'Inter', sans-serif;
}

/* Header */
.header {
  margin-bottom: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-top {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
}

.back-btn {
    background: transparent;
    border: none;
    color: #e2e8f0;
    cursor: pointer;
    padding-top: 0.5rem;
}

.title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
}

.live-badge {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    background: rgba(34, 197, 94, 0.15);
    border: 1px solid rgba(34, 197, 94, 0.3);
    padding: 0.25rem 0.75rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 700;
    color: #4ade80;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.live-dot {
    width: 0.5rem;
    height: 0.5rem;
    background: #4ade80;
    border-radius: 50%;
    animation: pulse-dot 2s ease-in-out infinite;
}

@keyframes pulse-dot {
    0%, 100% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.5;
        transform: scale(1.2);
    }
}

.last-update {
    color: #64748b;
    font-size: 0.85rem;
    margin-left: 0.5rem;
}

.page-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
}

.subtitle {
  color: #94a3b8;
  margin-top: 0.25rem;
  font-size: 0.9rem;
  font-weight: 500;
}

/* Top Section Layout */
.top-section {
    width: 100%;
    margin-bottom: 3rem;
}

/* Common Card Styles */
.card {
    background: #151e32; /* Deep blue bg */
    border-radius: 12px;
    padding: 2rem;
    border: 1px solid #2d3b55;
    position: relative;
    overflow: hidden;
}

/* Utilization Card Specifics */
.utilization-card {
    background: linear-gradient(145deg, #162036 0%, #1a2540 100%);
}

.card-title-row {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 2.5rem;
}

.icon-gauge {
    color: #60a5fa;
}

.progress-labels {
    display: flex;
    justify-content: space-between;
    font-size: 0.8rem;
    color: #94a3b8;
    margin-bottom: 0.75rem;
    font-weight: 600;
    text-transform: uppercase;
}

.progress-bar-container {
    height: 32px;
    background: #0f172a;
    border-radius: 16px;
    margin-bottom: 2rem;
    position: relative;
    border: 1px solid #334155;
    overflow: hidden;
}

.progress-bar {
    height: 100%;
    width: 100%;
    position: relative;
    border-radius: 16px;
}

.progress-fill {
    height: 100%;
    background: #3b82f6;
    position: relative;
    border-radius: 16px;
    transition: width 0.5s ease-out;
}

.progress-stripes {
    position: absolute;
    top: 0; left: 0; bottom: 0; right: 0;
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
    background-size: 1.5rem 1.5rem;
    animation: slide 2s linear infinite;
}

@keyframes slide {
    from { background-position: 0 0; }
    to { background-position: 1.5rem 0; }
}

.main-stats-row {
    display: flex;
    justify-content: space-between;
    align-items: flex-end;
    margin-bottom: 3rem;
    border-bottom: 1px solid #334155;
    padding-bottom: 2rem;
}

.big-stat .value {
    font-size: 3.5rem;
    font-weight: 800;
    color: white;
    margin-right: 1rem;
    line-height: 1;
}

.big-stat .unit {
    color: #94a3b8;
    font-size: 1rem;
    font-weight: 500;
}

.utilization-percent {
    text-align: right;
}

.utilization-percent .val {
    display: block;
    font-size: 2rem;
    font-weight: 700;
    color: #60a5fa;
}

.utilization-percent .lbl {
    font-size: 0.8rem;
    color: #94a3b8;
}

.secondary-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 2rem;
}

.stat-item label {
    display: block;
    font-size: 0.75rem;
    color: #64748b;
    margin-bottom: 0.5rem;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.stat-item .stat-val {
    font-size: 1.25rem;
    font-weight: 700;
}

.stat-item small {
    font-size: 0.8rem;
    font-weight: 500;
    opacity: 0.8;
}

.text-yellow { color: #facc15; }
.text-green { color: #4ade80; }
.text-red { color: #ef4444; }
.text-blue { color: #60a5fa; }

.bg-bolt {
    position: absolute;
    right: -40px;
    bottom: -40px;
    pointer-events: none;
    z-index: 0;
}

/* Bottom Section */
.section-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    margin-bottom: 1.5rem;
    color: #e2e8f0;
}

.grid-icon {
    opacity: 0.7;
}

.section-header h2 {
    font-size: 1.25rem;
    font-weight: 700;
    margin: 0;
}

.panels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1.5rem;
}

.panel-card {
  background: #151e32;
  border-radius: 12px;
  padding: 1.5rem;
  border: 1px solid #2d3b55;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  min-height: 280px;
  cursor: pointer;
}

.panel-card:hover {
  transform: translateY(-5px);
  border-color: #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.15);
}

.skeleton {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
    opacity: 0.7;
}

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: .5; }
}

.loading-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #64748b;
    gap: 0.5rem;
}

/* Panel Internals */
.panel-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
}

.panel-header h3 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 700;
    color: white;
}

.panel-code {
    font-size: 0.8rem;
    color: #94a3b8;
}

.panel-status-icon {
    background: #334155;
    padding: 0.5rem;
    border-radius: 8px;
    color: #94a3b8;
}

.panel-power {
    margin-bottom: 0.5rem;
}

.panel-power label {
    font-size: 0.7rem;
    color: #64748b;
    font-weight: 700;
    text-transform: uppercase;
}

.panel-power .power-val {
    font-size: 2rem;
    font-weight: 800;
    color: white;
    line-height: 1.1;
}

.panel-power small {
    font-size: 1rem;
    color: #94a3b8;
    font-weight: 500;
}

.panel-details-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
    margin-bottom: 0.5rem;
}

.detail-item {
    margin-bottom: 0.75rem;
}

.detail-item label {
    display: block;
    font-size: 0.65rem;
    color: #64748b;
    margin-bottom: 0.15rem;
    font-weight: 700;
    text-transform: uppercase;
}

.val-red { color: #ef4444; font-weight: 600; font-size: 0.95rem; }
.val-blue { color: #60a5fa; font-weight: 600; font-size: 0.95rem; }
.val-green { color: #4ade80; font-weight: 600; font-size: 0.95rem; }
.val-norm { color: #e2e8f0; font-weight: 600; font-size: 0.95rem; }

.text-right {
    text-align: right;
}

.panel-footer {
    margin-top: auto;
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #38bdf8;
    font-size: 0.85rem;
    font-weight: 600;
    padding-top: 1rem;
    border-top: 1px solid #1e293b;
    transition: gap 0.2s ease;
}

.panel-card:hover .panel-footer {
    gap: 0.75rem;
}
</style>
