<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { WifiOff, RefreshCw } from 'lucide-vue-next';

const showWarning = ref(false);
const message = ref('Connection to server lost. Attempting to reconnect...');
const isReconnecting = ref(false);

const handleDisconnect = (event: Event) => {
  const customEvent = event as CustomEvent;
  if (customEvent.detail && customEvent.detail.message) {
    message.value = customEvent.detail.message;
  }
  showWarning.value = true;
  isReconnecting.value = true;
};

const handleReconnect = () => {
  showWarning.value = false;
  isReconnecting.value = false;
};

// Force retry manually
const retryConnection = () => {
    window.location.reload();
};

onMounted(() => {
  window.addEventListener('backend-disconnected', handleDisconnect);
  window.addEventListener('backend-reconnected', handleReconnect);
});

onUnmounted(() => {
  window.removeEventListener('backend-disconnected', handleDisconnect);
  window.removeEventListener('backend-reconnected', handleReconnect);
});
</script>

<template>
  <Transition name="fade">
    <div v-if="showWarning" class="warning-overlay">
      <div class="warning-modal">
        <div class="icon-wrapper">
            <div class="pulse-ring"></div>
            <WifiOff class="w-8 h-8 text-red-500 relative z-10" />
        </div>
        
        <div class="content">
            <h3 class="title">Connection Lost</h3>
            <p class="description">
                {{ message }}
            </p>
            <p class="sub-text">
                Please check your network connection or contact system administrator.
            </p>
        </div>

        <div class="actions">
             <button @click="retryConnection" class="retry-btn">
                <RefreshCw class="w-4 h-4 mr-2" :class="{ 'spin': isReconnecting }" />
                Reload Application
             </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.warning-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.85);
  backdrop-filter: blur(8px);
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: center;
}

.warning-modal {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 16px;
  padding: 2.5rem;
  max-width: 420px;
  width: 90%;
  text-align: center;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: slide-up 0.3s ease-out;
}

@keyframes slide-up {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
}

.icon-wrapper {
  position: relative;
  width: 72px;
  height: 72px;
  background: rgba(239, 68, 68, 0.1);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(239, 68, 68, 0.2);
}

.pulse-ring {
  position: absolute;
  inset: -4px;
  border-radius: 50%;
  border: 2px solid rgba(239, 68, 68, 0.4);
  animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;
}

@keyframes ping {
    75%, 100% {
        transform: scale(1.5);
        opacity: 0;
    }
}

.title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin: 0;
  letter-spacing: -0.025em;
}

.description {
  color: #e2e8f0;
  font-size: 1.1rem;
  line-height: 1.5;
  margin: 0;
}

.sub-text {
    color: #64748b;
    font-size: 0.9rem;
    margin: 0;
}

.actions {
    width: 100%;
    margin-top: 0.5rem;
}

.retry-btn {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.875rem 1rem;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
    box-shadow: 0 4px 6px -1px rgba(59, 130, 246, 0.3);
}

.retry-btn:hover {
    background-color: #2563eb;
    box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
    transform: translateY(-1px);
}

.spin {
    animation: spin 3s linear infinite;
}

@keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
