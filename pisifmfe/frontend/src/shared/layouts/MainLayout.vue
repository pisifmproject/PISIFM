<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "../components/AppSidebar.vue";
import AppHeader from "../components/AppHeader.vue";

const sidebarOpen = ref(true);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>

<template>
  <div class="layout-container">
    <AppSidebar 
      :isOpen="sidebarOpen" 
      @toggle="toggleSidebar"
    />
    
    <div class="main-column" :class="{ 'expanded': !sidebarOpen }">
      <AppHeader 
        :isSidebarOpen="sidebarOpen"
        @toggle-sidebar="toggleSidebar"
      />
      
      <main class="page-content">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
</template>

<style scoped>
.layout-container {
  display: flex;
  height: 100vh;
  width: 100vw;
  background-color: #020617;
  overflow: hidden;
  position: relative;
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  transition: margin-left 0.3s ease;
}

.page-content {
  flex: 1;
  overflow-y: auto;
  padding: 2rem;
  position: relative;
}

/* Transitions */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
