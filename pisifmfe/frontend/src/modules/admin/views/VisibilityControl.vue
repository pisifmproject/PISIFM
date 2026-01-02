<script setup lang="ts">
import { ref } from 'vue';
import { 
  Eye, 
  Search, 
  Filter, 
  Globe, 
  List, 
  LayoutDashboard,
  Check
} from 'lucide-vue-next';

// Mock Data for Filters
const roles = ['Supervisor', 'Operator', 'Maintenance', 'Management', 'Viewer'];
const plants = ['All Plants (Default)', 'Cikokol', 'Semarang', 'Cikupa', 'Agro'];
const dashboards = ['Global Dashboard', 'Plant Dashboard', 'Electrical Dashboard'];

// Mock State for Settings
const selectedRole = ref('Supervisor');
const selectedPlant = ref('All Plants (Default)');
const selectedDashboard = ref('Global Dashboard');
const searchQuery = ref('');

// Mock Settings Data (KPIs and Lists)
const kpiSettings = ref([
  { id: 'total_output', label: 'Total Output', enabled: true },
  { id: 'global_oee', label: 'Global Avg OEE', enabled: true },
  { id: 'total_energy', label: 'Total Energy', enabled: true },
  { id: 'active_alarms', label: 'Active Alarms', enabled: true, subtext: 'GLOBAL_TOTAL_ALARMS' },
]);

const listSettings = ref([
  { id: 'overview_cikokol', label: 'Overview Plant Cikokol', enabled: true },
  { id: 'overview_semarang', label: 'Overview Plant Semarang', enabled: true },
  { id: 'overview_cikupa', label: 'Overview Plant Cikupa', enabled: true },
  { id: 'overview_agro', label: 'Overview Plant Agro', enabled: true },
]);

const toggleKpi = (id: string) => {
  const item = kpiSettings.value.find(i => i.id === id);
  if (item) item.enabled = !item.enabled;
};

const toggleList = (id: string) => {
  const item = listSettings.value.find(i => i.id === id);
  if (item) item.enabled = !item.enabled;
};

</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <Eye class="w-8 h-8 text-blue-500" />
        <h1 class="text-2xl font-bold text-white tracking-tight">Master Visibility Settings</h1>
      </div>
      <p class="text-slate-400 max-w-3xl">
        Configure system-wide visibility rules and dashboard layout preferences across all plant scopes.
      </p>
    </div>

    <!-- Filter Bar -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <!-- Role Filter -->
      <div class="relative group">
         <select 
            v-model="selectedRole"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
      </div>

      <!-- Plant Scope Filter -->
      <div class="relative group">
         <select 
            v-model="selectedPlant"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option v-for="plant in plants" :key="plant" :value="plant">{{ plant }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
      </div>

      <!-- Dashboard Type Filter -->
      <div class="relative group">
         <select 
            v-model="selectedDashboard"
            class="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-8 py-2.5 text-slate-200 focus:border-blue-500 focus:outline-none appearance-none cursor-pointer hover:border-slate-600 transition-colors"
          >
            <option v-for="dash in dashboards" :key="dash" :value="dash">{{ dash }}</option>
          </select>
          <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
          </div>
      </div>

      <!-- Search -->
      <div class="relative">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search settings..."
          class="w-full bg-slate-950 border border-slate-700 text-slate-200 pl-10 pr-4 py-2.5 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-600 hover:border-slate-600 transition-colors"
        >
      </div>
    </div>

    <!-- Content Sections -->
    <div class="space-y-6">
      
      <!-- Section Header -->
      <div class="flex items-center gap-2 pb-2 border-b border-slate-700/50">
        <Globe class="w-5 h-5 text-slate-400" />
        <h2 class="text-lg font-semibold text-slate-200">{{ selectedDashboard }}</h2>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        <!-- KPI Group -->
        <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
           <div class="flex items-center justify-between mb-4">
             <div class="flex items-center gap-2">
               <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               <span class="text-sm font-bold text-slate-400 uppercase tracking-wider">KPI</span>
             </div>
             <span class="bg-slate-700/50 text-slate-400 text-xs px-2 py-0.5 rounded-full">{{ kpiSettings.length }}</span>
           </div>

           <div class="divide-y divide-slate-700/30">
             <div 
                v-for="item in kpiSettings" 
                :key="item.id"
                class="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div>
                  <p class="text-sm font-medium text-slate-200">{{ item.label }}</p>
                  <p v-if="item.subtext" class="text-xs text-slate-500 mt-0.5 font-mono">{{ item.subtext }}</p>
                </div>
                
                <!-- Toggle Switch -->
                <button 
                  @click="toggleKpi(item.id)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  :class="item.enabled ? 'bg-blue-600' : 'bg-slate-700'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="item.enabled ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
             </div>
           </div>
        </div>

        <!-- Lists Group -->
         <div class="bg-slate-800/30 rounded-xl border border-slate-700/50 p-5">
           <div class="flex items-center justify-between mb-4">
             <div class="flex items-center gap-2">
               <div class="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
               <span class="text-sm font-bold text-slate-400 uppercase tracking-wider">LIST</span>
             </div>
             <span class="bg-slate-700/50 text-slate-400 text-xs px-2 py-0.5 rounded-full">{{ listSettings.length }}</span>
           </div>

           <div class="divide-y divide-slate-700/30">
             <div 
                v-for="item in listSettings" 
                :key="item.id"
                class="py-4 first:pt-0 last:pb-0 flex items-center justify-between"
              >
                <div>
                  <p class="text-sm font-medium text-slate-200">{{ item.label }}</p>
                </div>
                
                <!-- Toggle Switch -->
                <button 
                  @click="toggleList(item.id)"
                  class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  :class="item.enabled ? 'bg-blue-600' : 'bg-slate-700'"
                >
                  <span
                    class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform"
                    :class="item.enabled ? 'translate-x-6' : 'translate-x-1'"
                  />
                </button>
             </div>
           </div>
        </div>

      </div>
    </div>
  </div>
</template>
