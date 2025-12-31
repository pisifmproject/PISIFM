<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "@/stores/auth";
import BackendWarning from "@/shared/components/BackendWarning.vue";

const { initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <BackendWarning />
  <router-view />
</template>
