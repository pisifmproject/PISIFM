<script setup lang="ts">
import { useRoute } from 'vue-router';
import { Flame } from 'lucide-vue-next';

const route = useRoute();
</script>

<template>
  <div class="util-dashboard">
    <div class="header">
      <div class="icon-box"><Flame class="w-8 h-8 text-white"/></div>
      <div>
        <h1 class="title">Gas Management</h1>
        <p class="subtitle">Plant: {{ route.params.plantId }}</p>
      </div>
    </div>
    <div class="card">
       <p class="placeholder">Gas consumption metrics will be displayed here.</p>
    </div>
  </div>
</template>

<style scoped>
.util-dashboard { max-width: 1000px; margin: 0 auto; }
.header { display: flex; gap: 1.5rem; align-items: center; margin-bottom: 2rem; }
.icon-box { background: #eab308; padding: 1rem; border-radius: 0.75rem; }
.title { font-size: 1.8rem; font-weight: 700; color: white; margin: 0; }
.subtitle { color: #94a3b8; text-transform: uppercase; margin-top: 0.25rem; font-size: 0.9rem;}
.card { background: #1e293b; padding: 3rem; border-radius: 1rem; text-align: center; border: 1px solid #334155; }
.placeholder { color: #64748b; }
</style>
