<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Factory, Cog } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as PlantId);
const plant = computed(() => PLANTS[plantId.value]);

function navigateToMachine(machineId: string) {
  router.push({
    name: 'MachineDetailPerformance',
    params: {
      plantId: plantId.value,
      machineId: machineId
    }
  });
}
</script>

<template>
  <div class="prod-dashboard">
    <div class="header">
      <h1 class="page-title">Production Lines</h1>
      <p class="subtitle">Select a line to monitor detailed performance</p>
    </div>

    <div class="machines-grid" v-if="plant">
        <div 
          v-for="machine in plant.machines" 
          :key="machine.id"
          class="machine-card"
          @click="navigateToMachine(machine.id)"
        >
          <div class="icon-wrapper">
             <Cog class="w-8 h-8" />
          </div>
          <div class="info">
            <h3>{{ machine.name }}</h3>
            <span class="status-text">Status: Offline</span> 
            <!-- Placeholder status for now, dynamic service to be added -->
          </div>
          <div class="arrow">→</div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.prod-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2.5rem;
}

.page-title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0;
}

.subtitle {
  color: #94a3b8;
  margin-top: 0.5rem;
}

.machines-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

.machine-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #334155;
  cursor: pointer;
  transition: all 0.2s;
}

.machine-card:hover {
  border-color: #3b82f6;
  transform: translateY(-2px);
  background: #253347;
}

.icon-wrapper {
  width: 3rem;
  height: 3rem;
  background: #0f172a;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.machine-card:hover .icon-wrapper {
  color: #38bdf8;
}

.info h3 {
  color: white;
  font-size: 1rem;
  margin: 0 0 0.25rem 0;
  font-weight: 600;
}

.status-text {
  font-size: 0.85rem;
  color: #94a3b8;
}

.arrow {
  margin-left: auto;
  color: #475569;
}

.machine-card:hover .arrow {
  color: white;
}
</style>
