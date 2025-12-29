<script setup lang="ts">
import { PLANTS } from '@/config/app.config';
import { useRouter } from 'vue-router';
import { Factory, Activity, Zap, TrendingUp } from 'lucide-vue-next';

const router = useRouter();

function navigateToPlant(plantId: string) {
  router.push(`/plant/${plantId}`);
}
</script>

<template>
  <div class="dashboard-container">
    <div class="welcome-section">
      <h1 class="title">Corporate Overview</h1>
      <p class="subtitle">Aggregated monitoring across all manufacturing plants</p>
    </div>

    <!-- Summary Metrics -->
    <div class="metrics-grid">
      <div class="metric-card highlight">
        <div class="metric-icon"><Activity /></div>
        <div class="metric-content">
          <span class="label">Total Plants</span>
          <span class="value">{{ Object.keys(PLANTS).length }}</span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><Zap /></div>
        <div class="metric-content">
          <span class="label">Total Power Consumption</span>
          <span class="value">12.5 <span class="unit">MW</span></span>
        </div>
      </div>
      <div class="metric-card">
        <div class="metric-icon"><TrendingUp /></div>
        <div class="metric-content">
          <span class="label">Avg Efficiency</span>
          <span class="value">94.2%</span>
        </div>
      </div>
    </div>

    <!-- Plants Grid -->
    <h2 class="section-title">Plant Performance</h2>
    <div class="plants-grid">
      <div 
        v-for="plant in PLANTS" 
        :key="plant.id" 
        class="plant-card"
        @click="navigateToPlant(plant.id)"
      >
        <div class="card-header">
          <div class="icon-box">
            <Factory class="icon" />
          </div>
          <div class="status-indicator online"></div>
        </div>
        
        <h3 class="plant-name">{{ plant.name }}</h3>
        <p class="plant-id">ID: {{ plant.id.toUpperCase() }}</p>

        <div class="plant-stats">
          <div class="stat-row">
            <span>Status</span>
            <span class="stat-val text-green">Operational</span>
          </div>
          <div class="stat-row">
            <span>Machines</span>
            <span class="stat-val">{{ plant.machines.length }} Active</span>
          </div>
          <div class="stat-row">
            <span>Mode</span>
            <span class="stat-val" :class="plant.useRealData ? 'text-blue' : 'text-orange'">
              {{ plant.useRealData ? 'REAL-TIME' : 'SIMULATION' }}
            </span>
          </div>
        </div>

        <div class="card-footer">
          <span>View Dashboard</span>
          <span class="arrow">→</span>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-container {
  max-width: 1600px;
  margin: 0 auto;
}

.welcome-section {
  margin-bottom: 2.5rem;
}

.title {
  font-size: 2.5rem;
  font-weight: 800;
  color: white;
  margin-bottom: 0.5rem;
  letter-spacing: -0.03em;
}

.subtitle {
  color: #94a3b8;
  font-size: 1.1rem;
}

/* Metrics Grid */
.metrics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-bottom: 3rem;
}

.metric-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  display: flex;
  align-items: center;
  gap: 1.25rem;
  border: 1px solid #334155;
  transition: transform 0.2s;
}

.metric-card:hover {
  transform: translateY(-4px);
}

.metric-card.highlight {
  background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
  border: none;
}

.metric-icon {
  width: 3.5rem;
  height: 3.5rem;
  border-radius: 1rem;
  background: rgba(255, 255, 255, 0.1);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.metric-content {
  display: flex;
  flex-direction: column;
}

.metric-content .label {
  font-size: 0.875rem;
  color: #cbd5e1;
  margin-bottom: 0.25rem;
}

.metric-content .value {
  font-size: 1.75rem;
  font-weight: 700;
  color: white;
}

.metric-content .unit {
  font-size: 1rem;
  font-weight: 500;
  color: #94a3b8;
}

/* Plants Grid */
.section-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 1.5rem;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.plant-card {
  background: #1e293b;
  border-radius: 1rem;
  padding: 1.5rem;
  cursor: pointer;
  border: 1px solid #334155;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.plant-card:hover {
  border-color: #3b82f6;
  box-shadow: 0 10px 30px -10px rgba(59, 130, 246, 0.3);
  transform: translateY(-4px);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.icon-box {
  width: 3rem;
  height: 3rem;
  background-color: #0f172a;
  border-radius: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #38bdf8;
}

.status-indicator {
  width: 0.75rem;
  height: 0.75rem;
  border-radius: 50%;
  position: relative;
}

.status-indicator.online {
  background-color: #22c55e;
  box-shadow: 0 0 10px #22c55e;
}

.plant-name {
  font-size: 1.25rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.25rem;
}

.plant-id {
  font-size: 0.875rem;
  color: #64748b;
  margin-bottom: 1.5rem;
}

.plant-stats {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1.5rem;
  border-bottom: 1px solid #334155;
}

.stat-row {
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #94a3b8;
}

.stat-val {
  font-weight: 600;
  color: #e2e8f0;
}

.text-green { color: #4ade80; }
.text-blue { color: #60a5fa; }
.text-orange { color: #fb923c; }

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #38bdf8;
  font-weight: 600;
  font-size: 0.9rem;
}

.arrow {
  transition: transform 0.2s;
}

.plant-card:hover .arrow {
  transform: translateX(5px);
}
</style>
