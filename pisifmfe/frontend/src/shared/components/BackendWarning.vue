<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const isVisible = ref(false);

const showWarning = () => {
  isVisible.value = true;
};

const hideWarning = () => {
  isVisible.value = false;
};

/**
 * Handle manual page reload
 */
const reloadPage = () => {
  window.location.reload();
};

onMounted(() => {
  // Listen to custom events dispatched by the API interceptor
  window.addEventListener('backend-disconnected', showWarning as EventListener);
  window.addEventListener('backend-reconnected', hideWarning as EventListener);
});

onUnmounted(() => {
  window.removeEventListener('backend-disconnected', showWarning as EventListener);
  window.removeEventListener('backend-reconnected', hideWarning as EventListener);
});
</script>

<template>
  <Transition name="fade">
    <div 
      v-if="isVisible" 
      class="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
    >
      <div 
        class="w-full max-w-md bg-slate-900 border border-slate-700 shadow-2xl rounded-lg overflow-hidden relative ring-1 ring-white/10"
      >
        <!-- Subtle gradient glow at top right -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>

        <div class="p-6 relative">
          <div class="flex items-start gap-4">
            <!-- Icon Container -->
            <div class="flex-shrink-0 p-3 bg-red-500/10 rounded-lg ring-1 ring-red-500/20">
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                class="h-6 w-6 text-red-500" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor" 
                stroke-width="2"
              >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <h3 class="text-lg font-semibold text-white tracking-tight">
                Connection Lost
              </h3>
              <p class="mt-1 text-sm text-slate-400 leading-relaxed">
                The application cannot communicate with the server. Automatic retries are in progress.
              </p>
            </div>
          </div>
          
          <!-- Status Indicator and Actions -->
          <div class="mt-6 flex items-center justify-between">
             <div class="flex items-center gap-2.5">
               <span class="relative flex h-2.5 w-2.5">
                  <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span class="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </span>
                <span class="text-xs font-medium text-red-400 uppercase tracking-wider">Reconnecting...</span>
             </div>

             <button 
               @click="reloadPage" 
               class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded border border-slate-600 transition-colors uppercase tracking-wide hover:border-slate-500"
             >
               Reload Page
             </button>
          </div>
        </div>
        
        <!-- Technical Line at Bottom -->
        <div class="h-0.5 w-full bg-slate-800">
          <!-- Indeterminate progress bar using CSS animation could go here, or just a static color line -->
          <div class="h-full bg-red-500/20 w-full"></div>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease, backdrop-filter 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  backdrop-filter: blur(0);
}
</style>
