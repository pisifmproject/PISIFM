<script setup lang="ts">
import { computed } from 'vue';
import { Scale, CheckCircle2, AlertTriangle, XCircle, Power } from 'lucide-vue-next';

interface Props {
  id: number;
  status: 'RUNNING' | 'ON' | 'OFF';
  isSelected?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['click']);

const statusColor = computed(() => {
  switch (props.status) {
    case 'RUNNING': return 'bg-green-500 shadow-[0_0_15px_rgba(34,197,94,0.4)] border-green-400';
    case 'ON': return 'bg-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.4)] border-amber-400';
    case 'OFF': return 'bg-gray-700 border-gray-600';
    default: return 'bg-gray-700 border-gray-600';
  }
});

const statusText = computed(() => {
  switch (props.status) {
    case 'RUNNING': return 'text-green-400';
    case 'ON': return 'text-amber-400';
    case 'OFF': return 'text-gray-500';
    default: return 'text-gray-500';
  }
});

const statusIcon = computed(() => {
    switch (props.status) {
    case 'RUNNING': return CheckCircle2;
    case 'ON': return AlertTriangle; // Or something implying idle/ready
    default: return XCircle;
  }
});
</script>

<template>
  <div 
    class="weigher-card cursor-pointer relative group transition-all duration-300 hover:-translate-y-1"
    :class="[
      isSelected ? 'ring-2 ring-blue-500 scale-105 z-10' : 'hover:shadow-lg',
      props.status === 'OFF' ? 'opacity-80' : ''
    ]"
    @click="emit('click')"
  >
    <!-- Card Body -->
    <div class="h-24 bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700 rounded-lg p-3 flex flex-col justify-between relative overflow-hidden">
        
        <!-- Status Indicator Strip -->
        <div class="absolute top-0 left-0 w-1 h-full" :class="statusColor.split(' ')[0]"></div>

        <!-- Header -->
        <div class="flex justify-between items-start">
            <span class="text-xs font-bold text-gray-400 uppercase tracking-wider">WEIGHER {{ id }}</span>
            <component :is="statusIcon" class="w-4 h-4" :class="statusText" />
        </div>

        <!-- Icon & Main Visual -->
        <div class="flex items-center gap-3 mt-2">
            <div class="w-8 h-8 rounded bg-gray-700/50 flex items-center justify-center border border-gray-600">
                <Scale class="w-5 h-5 text-gray-300" />
            </div>
            <div>
                <div class="text-sm font-bold text-white tracking-wide" :class="status === 'OFF' ? 'text-gray-500' : ''">
                    {{ status }}
                </div>
            </div>
        </div>

        <!-- Pulse effect for running -->
        <div v-if="status === 'RUNNING'" class="absolute right-2 bottom-2 w-2 h-2 rounded-full bg-green-500 animate-ping opacity-75"></div>
    </div>
  </div>
</template>

<style scoped>
.weigher-card {
    user-select: none;
}
</style>
