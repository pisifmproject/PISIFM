<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Zap, ArrowRight, Gauge } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as PlantId);
const plant = computed(() => PLANTS[plantId.value]);

function navigateToLvmdp(id: number) {
  router.push(`/plant/${plantId.value}/energy/electricity/lvmdp/${id}`);
}
</script>

<template>
  <div class="elec-dashboard">
    <div class="header">
      <h1 class="page-title">Electrical Overview</h1>
      <p class="subtitle">Real-time monitoring of Main Distribution Panels</p>
    </div>

    <!-- Overview Stats (Placeholder for future aggregation) -->
    <div class="stats-overview">
      <div class="stat-box">
        <span class="label">Total Capacity</span>
        <span class="value">22,160 <span class="unit">kVA</span></span>
      </div>
      <div class="stat-box">
        <span class="label">Panels Online</span>
        <span class="value">4 <span class="unit">/ 4</span></span>
      </div>
    </div>

    <div class="panels-grid">
      <div 
        v-for="i in 4" 
        :key="i"
        class="panel-card"
        @click="navigateToLvmdp(i)"
      >
        <div class="card-chip">LVMDP {{ i }}</div>
        
        <div class="panel-icon">
          <Zap class="w-8 h-8" />
        </div>

        <div class="panel-info">
          <h3>Main Distribution Panel {{ i }}</h3>
          <p>Capacity: 5540 kVA</p>
        </div>

        <div class="card-action">
          <span>Monitor</span>
          <ArrowRight class="w-4 h-4" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.elec-dashboard {
  max-width: 1200px;
  margin: 0 auto;
}

.header {
  margin-bottom: 2rem;
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

.stats-overview {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.stat-box {
  background: #1e293b;
  padding: 1.5rem 2rem;
  border-radius: 1rem;
  border: 1px solid #334155;
}

.stat-box .label {
  display: block;
  font-size: 0.875rem;
  color: #94a3b8;
  margin-bottom: 0.5rem;
}

.stat-box .value {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
}

.stat-box .unit {
  font-size: 1rem;
  color: #64748b;
  font-weight: 500;
}

.panels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 2rem;
}

.panel-card {
  background: #1e293b;
  border-radius: 1.5rem;
  padding: 2rem;
  position: relative;
  cursor: pointer;
  border: 1px solid #334155;
  transition: all 0.3s ease;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.panel-card:hover {
  transform: translateY(-5px);
  border-color: #3b82f6;
  box-shadow: 0 10px 25px -5px rgba(59, 130, 246, 0.25);
}

.card-chip {
  position: absolute;
  top: 1.5rem;
  right: 1.5rem;
  font-size: 0.75rem;
  font-weight: 700;
  color: #38bdf8;
  background: rgba(56, 189, 248, 0.1);
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  border: 1px solid rgba(56, 189, 248, 0.2);
}

.panel-icon {
  width: 3.5rem;
  height: 3.5rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.panel-info h3 {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.panel-info p {
  color: #94a3b8;
  margin: 0;
  font-size: 0.9rem;
}

.card-action {
  margin-top: auto;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
}
</style>
