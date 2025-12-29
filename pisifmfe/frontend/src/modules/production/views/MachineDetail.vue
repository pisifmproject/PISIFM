<script setup lang="ts">
import { computed } from 'vue';
import { useRoute } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Cog } from 'lucide-vue-next';

const route = useRoute();
const plantId = computed(() => route.params.plantId as PlantId);
const machineId = computed(() => route.params.machineId as string);

const plant = computed(() => PLANTS[plantId.value]);
const machine = computed(() => plant.value?.machines.find(m => m.id === machineId.value));
</script>

<template>
  <div class="machine-detail" v-if="machine">
    <div class="header">
       <div class="icon-box">
          <Cog class="w-8 h-8 text-white" />
       </div>
       <div>
          <h1 class="title">{{ machine.name }}</h1>
          <p class="subtitle">Production Data Monitoring</p>
       </div>
    </div>

    <div class="empty-state">
      <p>Real-time data integration for {{ machine.name }} is under development.</p>
    </div>
  </div>
  <div v-else class="error">
     Machine not found
  </div>
</template>

<style scoped>
.machine-detail {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 3rem;
  background: #1e293b;
  padding: 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
}

.icon-box {
  width: 4rem;
  height: 4rem;
  background: #3b82f6;
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
}

.title {
  font-size: 2rem;
  font-weight: 800;
  color: white;
  margin: 0;
  line-height: 1.1;
}

.subtitle {
  color: #94a3b8;
  margin-top: 0.25rem;
}

.empty-state {
  text-align: center;
  padding: 4rem;
  background: #1e293b; /* darker bg */
  border-radius: 1rem;
  color: #94a3b8;
  border: 1px dashed #334155;
}
</style>
