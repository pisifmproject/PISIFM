<script setup lang="ts">
import { onMounted } from "vue";
import { useAuth } from "@/stores/auth";

const { initAuth } = useAuth();

onMounted(() => {
  initAuth();
});
</script>

<template>
  <router-view />
</template>
