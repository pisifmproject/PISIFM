<script setup lang="ts">
import { computed } from 'vue';
import { Package, Smartphone, AlertOctagon, Activity } from 'lucide-vue-next';

interface Props {
  id: number;
  status: 'RUNNING' | 'ON' | 'OFF';
  isSelected?: boolean;
}

const props = defineProps<Props>();
const emit = defineEmits(['click']);

const statusColor = computed(() => {
  switch (props.status) {
    case 'RUNNING': return 'border-b-4 border-b-green-500';
    case 'ON': return 'border-b-4 border-b-amber-500';
    case 'OFF': return 'border-b-4 border-b-gray-600';
    default: return 'border-b-4 border-b-gray-600';
  }
});

const bgClass = computed(() => {
    if (props.status === 'RUNNING') return 'bg-gradient-to-t from-green-900/10 to-gray-800';
    if (props.status === 'ON') return 'bg-gradient-to-t from-amber-900/10 to-gray-800';
    return 'bg-gray-800';
});

</script>

<template>
  <div 
    class="bagmaker-card cursor-pointer relative transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
    :class="[
      isSelected ? 'ring-2 ring-blue-500 z-10' : '',
      statusColor,
      bgClass,
      props.status === 'OFF' ? 'opacity-70' : ''
    ]"
    @click="emit('click')"
  >
    <div class="p-3 border border-gray-700 border-b-0 rounded-t-lg h-24 flex flex-col justify-between">
        <div class="flex justify-between items-start">
             <div class="flex items-center gap-2">
                 <div class="p-1 rounded bg-gray-700 border border-gray-600">
                     <Package class="w-3 h-3 text-blue-300" />
                 </div>
                 <span class="text-xs font-bold text-gray-300">BM {{ id }}</span>
             </div>
             <div class="w-2 h-2 rounded-full" :class="status === 'RUNNING' ? 'bg-green-500 animate-pulse' : (status === 'ON' ? 'bg-amber-500' : 'bg-gray-600')"></div>
        </div>

        <div class="text-center mt-2">
            <span class="text-sm font-bold tracking-wider" :class="status === 'RUNNING' ? 'text-white' : 'text-gray-500'">{{ status }}</span>
        </div>
        
        <!-- Decoration lines -->
        <div class="flex gap-1 mt-auto mx-auto opacity-30">
            <div class="w-1 h-3 bg-gray-500 rounded-full"></div>
            <div class="w-1 h-3 bg-gray-500 rounded-full"></div>
            <div class="w-1 h-3 bg-gray-500 rounded-full"></div>
        </div>
    </div>
  </div>
</template>

<style scoped>
.bagmaker-card {
    border-radius: 0.5rem;
}
</style>
