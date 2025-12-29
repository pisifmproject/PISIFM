<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950"
  >
    <div
      class="bg-slate-900 border border-slate-700 p-8 rounded-lg shadow-2xl w-96 card-glass"
    >
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-slate-100 mb-2">SIFMS</h1>
        <p class="text-slate-400">Smart Plant Monitoring</p>
      </div>

      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            Username
          </label>
          <input
            v-model="username"
            type="text"
            required
            class="w-full px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition-colors"
            placeholder="Enter username"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-slate-300 mb-2">
            Password
          </label>
          <input
            v-model="password"
            type="password"
            required
            class="w-full px-4 py-2 bg-slate-800 border border-slate-600 text-slate-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500 transition-colors"
            placeholder="Enter password"
          />
        </div>

        <div
          v-if="error"
          class="text-red-400 text-sm text-center bg-red-950/30 border border-red-900/50 rounded-lg py-2"
        >
          {{ error }}
        </div>

        <button
          type="submit"
          class="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-lg transition-all font-medium shadow-lg shadow-blue-900/20"
        >
          Login
        </button>
      </form>

      <div class="mt-6 pt-6 border-t border-slate-800">
        <p class="text-xs text-slate-600 text-center">
          Monitoring System v2.0
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";

const router = useRouter();
const { login } = useAuth();

const username = ref("");
const password = ref("");
const error = ref("");

function handleLogin() {
  error.value = "";

  if (login(username.value, password.value)) {
    router.push("/global");
  } else {
    error.value = "Username atau password salah";
    password.value = "";
  }
}
</script>

<style scoped>
.card-glass {
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(12px);
}
</style>
