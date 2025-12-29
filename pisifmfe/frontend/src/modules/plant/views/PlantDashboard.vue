<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { PLANTS, type PlantId } from '@/config/app.config';
import { Activity, Zap, Factory, TrendingDown, Thermometer, Droplets, Wind, Flame } from 'lucide-vue-next';

const route = useRoute();
const router = useRouter();

const plantId = computed(() => route.params.plantId as PlantId);
const plant = computed(() => PLANTS[plantId.value]);

function navigateTo(path: string) {
  router.push(path);
}
</script>

<template>
  <div class="dashboard-container" v-if="plant">
    <!-- Header -->
    <div class="welcome-section">
      <div class="title-row">
        <h1 class="title">{{ plant.name }}</h1>
        <div 
          class="mode-badge" 
          :class="plant.useRealData ? 'real' : 'sim'"
        >
          {{ plant.useRealData ? 'LIVE DATA' : 'SIMULATION MODE' }}
        </div>
      </div>
      <p class="subtitle">Real-time operational overview and plant metrics</p>
    </div>

    <!-- Quick Navigation Cards -->
    <div class="nav-cards-grid">
      <!-- Energy Card -->
      <div 
        class="nav-card highlight"
        @click="navigateTo(`/plant/${plantId}/energy/electricity`)"
      >
        <div class="card-icon">
          <Zap />
        </div>
        <div class="card-content">
          <h3>Energy Management</h3>
          <p>Monitor LVMDP 1-4 and consumption</p>
        </div>
        <div class="arrow">→</div>
      </div>

       <!-- Production Card -->
       <div 
        class="nav-card"
        @click="navigateTo(`/plant/${plantId}/production`)"
      >
        <div class="card-icon">
          <Factory />
        </div>
        <div class="card-content">
          <h3>Production Lines</h3>
          <p>{{ plant.machines.length }} lines active</p>
        </div>
        <div class="arrow">→</div>
      </div>
    </div>

    <h2 class="section-title">Utility Quick Access</h2>
    <div class="utils-grid">
      <div class="util-card" @click="navigateTo(`/plant/${plantId}/energy/steam`)">
        <div class="util-icon text-orange"><Flame /></div>
        <span>Steam</span>
      </div>
      <div class="util-card" @click="navigateTo(`/plant/${plantId}/energy/water`)">
        <div class="util-icon text-blue"><Droplets /></div>
        <span>Water</span>
      </div>
      <div class="util-card" @click="navigateTo(`/plant/${plantId}/energy/compressed-air`)">
        <div class="util-icon text-cyan"><Wind /></div>
        <span>Compressed Air</span>
      </div>
      <div class="util-card" @click="navigateTo(`/plant/${plantId}/energy/nitrogen`)">
        <div class="util-icon text-gray"><Wind /></div>
        <span>Nitrogen</span>
      </div>
      <div class="util-card" @click="navigateTo(`/plant/${plantId}/energy/gas`)">
        <div class="util-icon text-yellow"><Flame /></div>
        <span>Gas</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1400px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.title-row {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  margin-bottom: 0.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  letter-spacing: -0.03em;
  margin: 0;
}

.mode-badge {
  padding: 0.25rem 0.75rem;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.mode-badge.real {
  background-color: rgba(34, 197, 94, 0.2);
  color: #4ade80;
  border: 1px solid rgba(34, 197, 94, 0.4);
}

.mode-badge.sim {
  background-color: rgba(249, 115, 22, 0.2);
  color: #fb923c;
  border: 1px solid rgba(249, 115, 22, 0.4);
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
}

/* Nav Cards */
.nav-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
}

.nav-card {
  background: #1e293b;
  border-radius: 1.5rem;
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  border: 1px solid #334155;
  transition: all 0.3s ease;
}

.nav-card:hover {
  transform: translateY(-4px);
  border-color: #3b82f6;
  box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.5);
}

.nav-card.highlight {
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
  border-left: 4px solid #38bdf8;
}

.card-icon {
  width: 4rem;
  height: 4rem;
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
}

.card-icon svg {
  width: 2rem;
  height: 2rem;
}

.card-content h3 {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0 0 0.25rem 0;
}

.card-content p {
  color: #94a3b8;
  margin: 0;
}

.arrow {
  margin-left: auto;
  font-size: 1.5rem;
  color: #64748b;
  font-weight: 300;
  transition: transform 0.2s;
}

.nav-card:hover .arrow {
  color: #38bdf8;
  transform: translateX(5px);
}

/* Utils Grid */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
}

.utils-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1.5rem;
}

.util-card {
  background: #1e293b;
  padding: 1.5rem;
  border-radius: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  cursor: pointer;
  border: 1px solid #334155;
  transition: all 0.2s;
}

.util-card:hover {
  background-color: #334155;
}

.util-icon {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 0.75rem;
  background-color: rgba(0,0,0,0.2);
  display: flex;
  align-items: center;
  justify-content: center;
}

.util-icon svg {
  width: 1.25rem;
  height: 1.25rem;
}

.util-card span {
  font-weight: 600;
  color: #e2e8f0;
}

.text-orange { color: #fb923c; }
.text-blue { color: #60a5fa; }
.text-cyan { color: #22d3ee; }
.text-gray { color: #9ca3af; }
.text-yellow { color: #facc15; }

</style>
