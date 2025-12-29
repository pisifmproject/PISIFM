<script setup lang="ts">
import { ref } from "vue";
import AppSidebar from "../components/AppSidebar.vue";
import AppHeader from "../components/AppHeader.vue";
import { Menu, X } from "lucide-vue-next";

const sidebarOpen = ref(true);

function toggleSidebar() {
  sidebarOpen.value = !sidebarOpen.value;
}
</script>

<template>
  <div class="layout-container">
    <button
      class="hamburger-btn"
      @click="toggleSidebar"
      :title="sidebarOpen ? 'Close sidebar' : 'Open sidebar'"
    >
      <Menu v-if="!sidebarOpen" :size="24" />
      <X v-else :size="24" />
    </button>
    <AppSidebar :isOpen="sidebarOpen" />
    <div class="main-column">
      <AppHeader />
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

.hamburger-btn {
  position: absolute;
  top: 1rem;
  left: 1rem;
  z-index: 1000;
  background: rgba(59, 130, 246, 0.8);
  border: none;
  border-radius: 6px;
  padding: 0.5rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: all 0.2s ease;
}

.hamburger-btn:hover {
  background: rgb(59, 130, 246);
}

.main-column {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
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
