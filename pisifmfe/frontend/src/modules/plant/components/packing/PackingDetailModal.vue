<script setup lang="ts">
import { X, Scale, Package, Activity, AlertTriangle, CheckCircle, Smartphone } from 'lucide-vue-next';

interface Props {
  isOpen: boolean;
  type: 'weigher' | 'bagmaker' | null;
  unitId: number | null;
  data: any;
}

const props = defineProps<Props>();
const emit = defineEmits(['close']);

const formatNumber = (num: number, dec = 1) => num ? num.toLocaleString('en-US', { minimumFractionDigits: dec, maximumFractionDigits: dec }) : '-';

</script>

<template>
  <div v-if="isOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4">
    <!-- Backdrop -->
    <div class="absolute inset-0 bg-black/80 backdrop-blur-sm transition-opacity" @click="emit('close')"></div>

    <!-- Modal Content -->
    <div class="relative bg-gray-900 border border-gray-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all scale-100">
        
        <!-- Header -->
        <div class="flex items-center justify-between p-6 border-b border-gray-800 bg-gray-800/50">
            <div class="flex items-center gap-4">
                <div class="p-3 rounded-lg border border-gray-700 bg-gray-800 shadow-md">
                     <Scale v-if="type === 'weigher'" class="w-6 h-6 text-blue-400" />
                     <Package v-else class="w-6 h-6 text-green-400" />
                </div>
                <div>
                    <h2 class="text-xl font-bold text-white tracking-wide">
                        {{ type === 'weigher' ? 'WEIGHER' : 'BAGMAKER' }} #{{ unitId }}
                    </h2>
                    <span class="text-xs text-gray-400 uppercase tracking-widest">MACHINE STATISTICS</span>
                </div>
            </div>
            <button @click="emit('close')" class="text-gray-400 hover:text-white transition-colors p-2 hover:bg-gray-800 rounded-full">
                <X class="w-6 h-6" />
            </button>
        </div>

        <!-- Body -->
        <div class="p-6">
            
            <!-- WEIGHER DETAIL -->
            <div v-if="type === 'weigher'" class="grid grid-cols-2 gap-6">
                 <!-- Main Stat -->
                 <div class="col-span-2 bg-gradient-to-r from-blue-900/20 to-gray-800 border border-blue-500/30 rounded-lg p-6 flex flex-col items-center text-center">
                      <span class="text-sm text-blue-300 uppercase font-bold tracking-wider mb-2">PRODUCTION SPEED</span>
                      <div class="text-5xl font-black text-white">{{ data.bpm }} <small class="text-lg text-gray-400 font-medium">BPM</small></div>
                 </div>

                 <!-- Stats Grid -->
                 <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div class="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase"><Activity class="w-3 h-3" /> Total Weight</div>
                      <div class="text-2xl font-bold text-white">{{ formatNumber(data.totalWeight) }} <small class="text-sm">kg</small></div>
                 </div>

                 <div class="bg-gray-800/50 rounded-lg p-4 border border-gray-700">
                      <div class="flex items-center gap-2 mb-2 text-gray-400 text-xs font-bold uppercase"><AlertTriangle class="w-3 h-3" /> Giveaway</div>
                      <div class="text-2xl font-bold text-yellow-400">{{ formatNumber(data.giveaway, 2) }} <small class="text-sm">%</small></div>
                 </div>

                 <div class="col-span-2 bg-gray-800/50 rounded-lg p-4 border border-gray-700 flex justify-between items-center">
                      <div class="flex items-center gap-2 text-gray-400 text-xs font-bold uppercase"><Activity class="w-3 h-3" /> Standard Deviation</div>
                      <div class="text-2xl font-bold text-blue-400">{{ formatNumber(data.stdDev, 3) }} <small class="text-sm">g</small></div>
                 </div>
            </div>

            <!-- BAGMAKER DETAIL -->
            <div v-if="type === 'bagmaker'" class="space-y-6">
                 <!-- Efficiency Header -->
                 <div class="grid grid-cols-3 gap-4">
                      <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                          <div class="text-xs text-gray-400 font-bold mb-1">TOTAL EFF</div>
                          <div class="text-2xl font-bold text-green-400">{{ formatNumber(data.totalEfficiency) }}%</div>
                      </div>
                      <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                          <div class="text-xs text-gray-400 font-bold mb-1">WEIGHER EFF</div>
                          <div class="text-2xl font-bold text-blue-400">{{ formatNumber(data.efficiencyWeigher) }}%</div>
                      </div>
                      <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700 text-center">
                          <div class="text-xs text-gray-400 font-bold mb-1">BAGMAKER EFF</div>
                          <div class="text-2xl font-bold text-purple-400">{{ formatNumber(data.efficiencyBagmaker) }}%</div>
                      </div>
                 </div>

                 <!-- Bag Stats -->
                 <div class="grid grid-cols-2 gap-4">
                      <div class="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                          <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-gray-700 pb-2">Bag Statistics</h4>
                          <div class="space-y-3">
                              <div class="flex justify-between">
                                  <span class="text-sm text-gray-300">Bag % (Good)</span>
                                  <span class="font-bold text-green-400">{{ formatNumber(data.bagGood) }}%</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-sm text-gray-300">Bag % (Bad)</span>
                                  <span class="font-bold text-red-400">{{ formatNumber(data.bagBad) }}%</span>
                              </div>
                              <div class="flex justify-between">
                                  <span class="text-sm text-gray-300">Wasted Film</span>
                                  <span class="font-bold text-orange-400">{{ formatNumber(data.wastedFilm) }}%</span>
                              </div>
                          </div>
                      </div>

                      <div class="bg-gray-800/30 p-4 rounded-lg border border-gray-700">
                          <h4 class="text-xs font-bold text-gray-500 uppercase mb-3 border-b border-gray-700 pb-2">Error / Detects</h4>
                          <div class="space-y-3">
                              <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Metal Detect</span>
                                  <span :class="data.metalDetect > 0 ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-500'" class="px-2 py-0.5 rounded text-xs font-bold">{{ data.metalDetect }}</span>
                              </div>
                              <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Printer Error</span>
                                  <span :class="data.printerError ? 'bg-red-500/20 text-red-400' : 'bg-green-500/20 text-green-400'" class="px-2 py-0.5 rounded text-xs font-bold">{{ data.printerError ? 'ERR' : 'OK' }}</span>
                              </div>
                              <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Product In Seal</span>
                                  <span :class="data.productInSeal ? 'bg-red-500/20 text-red-400' : 'bg-gray-700 text-gray-500'" class="px-2 py-0.5 rounded text-xs font-bold">{{ data.productInSeal ? 'YES' : 'NO' }}</span>
                              </div>
                              <div class="flex justify-between items-center">
                                  <span class="text-sm text-gray-300">Splice Detect</span>
                                  <span :class="data.spliceDetect ? 'bg-yellow-500/20 text-yellow-400' : 'bg-gray-700 text-gray-500'" class="px-2 py-0.5 rounded text-xs font-bold">{{ data.spliceDetect ? 'YES' : 'NO' }}</span>
                              </div>
                          </div>
                      </div>
                 </div>

                 <!-- Speed footer -->
                 <div class="bg-gradient-to-r from-gray-800 to-gray-900 border border-gray-700 p-4 rounded-lg flex justify-between items-center">
                     <span class="text-sm text-gray-400 font-bold uppercase">Actual Speed</span>
                     <span class="text-3xl font-bold text-white">{{ formatNumber(data.actualSpeed) }} <small class="text-sm text-gray-500">BPM</small></span>
                 </div>
            </div>

        </div>
    </div>
  </div>
</template>
