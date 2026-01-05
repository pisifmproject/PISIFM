<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue';
import WeigherCard from './WeigherCard.vue';
import BagmakerCard from './BagmakerCard.vue';
import PackingDetailModal from './PackingDetailModal.vue';
import { Package, Clock } from 'lucide-vue-next';

const props = defineProps<{
  machineId: string;
}>();

// --- Configuration ---
const LINE_CONFIG: Record<string, { weighers: number; bagmakers: number }> = {
  pc39: { weighers: 11, bagmakers: 22 },
  pc14: { weighers: 5, bagmakers: 10 },
  tortilla: { weighers: 7, bagmakers: 14 },
  tws56: { weighers: 5, bagmakers: 10 },
  fcp: { weighers: 6, bagmakers: 12 },
  tws72: { weighers: 10, bagmakers: 20 },
  copack: { weighers: 3, bagmakers: 6 },
  inhouse: { weighers: 5, bagmakers: 10 },
};

// --- State ---
const config = computed(() => {
    const id = props.machineId.toLowerCase().replace(/[^a-z0-9]/g, '');
    // Handle special mappings if needed, but assuming strict match for now
    if (LINE_CONFIG[id]) return LINE_CONFIG[id];
    
    // Fuzzy match attempts
    if (id.includes('pc39')) return LINE_CONFIG.pc39;
    if (id.includes('pc14')) return LINE_CONFIG.pc14;
    
    return null;
});

const weighers = ref<any[]>([]);
const bagmakers = ref<any[]>([]);
const selectedUnit = ref<{ type: 'weigher' | 'bagmaker'; id: number; data: any } | null>(null);
const isModalOpen = ref(false);

// --- Dummy Data Generators ---
const getRandomStatus = () => {
    const r = Math.random();
    if (r > 0.9) return 'OFF';
    if (r > 0.7) return 'ON';
    return 'RUNNING';
};

const generateWeigherData = (id: number) => ({
    id,
    status: getRandomStatus(),
    bpm: Math.floor(60 + Math.random() * 40),
    totalWeight: Math.floor(1000 + Math.random() * 5000),
    stdDev: 0.5 + Math.random(),
    giveaway: Math.random() * 5
});

const generateBagmakerData = (id: number) => ({
    id,
    status: getRandomStatus(),
    totalEfficiency: Math.floor(80 + Math.random() * 20),
    efficiencyWeigher: Math.floor(85 + Math.random() * 15),
    efficiencyBagmaker: Math.floor(85 + Math.random() * 15),
    bagGood: Math.floor(90 + Math.random() * 10),
    bagBad: Math.floor(Math.random() * 5),
    metalDetect: Math.random() > 0.95 ? 1 : 0,
    printerError: Math.random() > 0.95,
    productInSeal: Math.random() > 0.95,
    spliceDetect: Math.random() > 0.9,
    actualSpeed: Math.floor(50 + Math.random() * 30),
    wastedFilm: Math.random() * 3
});

// --- Lifecycle ---
const initData = () => {
    if (!config.value) return;
    
    // Generate Weighers
    weighers.value = Array.from({ length: config.value.weighers }, (_, i) => generateWeigherData(i + 1));
    
    // Generate Bagmakers
    bagmakers.value = Array.from({ length: config.value.bagmakers }, (_, i) => generateBagmakerData(i + 1));
};

watch(() => props.machineId, initData, { immediate: true });

// --- Interaction ---
const openDetail = (type: 'weigher' | 'bagmaker', unit: any) => {
    selectedUnit.value = { type, id: unit.id, data: unit };
    isModalOpen.value = true;
};

// --- Grouping Logic ---
// We assume 1 Weigher feeds 2 Bagmakers (1:2 ratio)
const groups = computed(() => {
    const g = [];
    if (!config.value) return [];
    
    for (let i = 0; i < config.value.weighers; i++) {
        const weigher = weighers.value[i];
        // Bagmakers for this weigher are roughly index 2*i and 2*i+1
        const bm1 = bagmakers.value[i * 2];
        const bm2 = bagmakers.value[i * 2 + 1];
        g.push({
            weigher,
            bagmakers: [bm1, bm2].filter(Boolean)
        });
    }
    return g;
});
</script>

<template>
  <div class="packing-overview fade-in min-h-[500px]">
    
    <!-- COMING SOON STATE -->
    <div v-if="!config" class="flex flex-col items-center justify-center py-20 bg-gray-900/50 rounded-xl border border-dashed border-gray-700">
        <div class="p-6 bg-gray-800 rounded-full mb-6 relative">
            <Clock class="w-12 h-12 text-blue-400" />
            <div class="absolute -right-1 -top-1 w-6 h-6 bg-yellow-500 rounded-full animate-bounce flex items-center justify-center text-xs font-bold text-black">!</div>
        </div>
        <h2 class="text-3xl font-bold text-white mb-2">Coming Soon</h2>
        <p class="text-gray-400 max-w-md text-center">
            The packing module for <span class="text-blue-300 font-bold uppercase">{{ machineId }}</span> is currently under development. 
            Check back later for updates.
        </p>
    </div>

    <!-- ACTIVE STATE -->
    <div v-else>
        <!-- Header Summary -->
        <div class="mb-6 flex justify-between items-end border-b border-gray-800 pb-4">
             <div>
                 <h3 class="text-lg font-bold text-gray-300">LINE CONFIGURATION</h3>
                 <div class="flex gap-4 mt-2">
                     <span class="text-sm px-3 py-1 bg-blue-900/30 text-blue-400 rounded border border-blue-800">{{ config.weighers }} Weighers</span>
                     <span class="text-sm px-3 py-1 bg-green-900/30 text-green-400 rounded border border-green-800">{{ config.bagmakers }} Bagmakers</span>
                 </div>
             </div>
             <div class="text-right">
                  <div class="text-xs text-gray-500 uppercase tracking-widest mb-1">LIVE SIMULATION</div>
                  <div class="flex items-center gap-2">
                       <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                       <span class="text-sm text-gray-400">System Online</span>
                  </div>
             </div>
        </div>

        <!-- Grid Layout -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div 
                v-for="(group, idx) in groups" 
                :key="idx" 
                class="packing-group p-4 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition-colors"
            >
                <!-- Weigher (Top) -->
                <WeigherCard 
                    :id="group.weigher.id" 
                    :status="group.weigher.status" 
                    class="mb-4"
                    @click="openDetail('weigher', group.weigher)"
                />
                
                <!-- Connector Line Visual -->
                <div class="flex justify-center mb-4 relative h-4">
                    <div class="absolute top-0 w-px h-full bg-gray-700"></div>
                    <div class="absolute bottom-0 w-2/3 h-px bg-gray-700"></div>
                    <div class="absolute bottom-0 left-[16.66%] w-px h-2 bg-gray-700"></div> <!-- Left Connect -->
                    <div class="absolute bottom-0 right-[16.66%] w-px h-2 bg-gray-700"></div> <!-- Right Connect -->
                </div>

                <!-- Bagmakers (Bottom) -->
                <div class="grid grid-cols-2 gap-3">
                    <BagmakerCard 
                        v-for="bm in group.bagmakers"
                        :key="bm.id"
                        :id="bm.id"
                        :status="bm.status"
                        @click="openDetail('bagmaker', bm)"
                    />
                </div>
            </div>
        </div>
    </div>

    <!-- Detail Modal -->
    <PackingDetailModal 
        :is-open="isModalOpen"
        :type="selectedUnit?.type || null"
        :unit-id="selectedUnit?.id || null"
        :data="selectedUnit?.data || {}"
        @close="isModalOpen = false"
    />

  </div>
</template>

<style scoped>
.packing-group {
    /* Subtle glass effect */
    backdrop-filter: blur(4px);
}
</style>
