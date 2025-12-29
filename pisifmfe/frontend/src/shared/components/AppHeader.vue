<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useAuth } from "@/stores/auth";
import { LogOut, User, Bell } from "lucide-vue-next";

const route = useRoute();
const router = useRouter();
const { username, logout } = useAuth();

// Clean page title without breadcrumbs
const pageTitle = computed(() => {
  // For LVMDP pages, show only "LVMDP X"
  if (route.name === "LVMDPDetail" && route.params.lvmdpId) {
    return `LVMDP ${route.params.lvmdpId}`;
  }
  
  // For other pages, show clean title
  const titleMap: Record<string, string> = {
    GlobalDashboard: "Global Dashboard",
    PlantDashboard: "Plant Dashboard",
    ElectricalDashboard: "Electrical Monitoring",
    SteamDetail: "Steam Monitoring",
    WaterDetail: "Water Monitoring",
    CompressedAirDetail: "Compressed Air Monitoring",
    NitrogenDetail: "Nitrogen Monitoring",
    GasDetail: "Gas Monitoring",
    ProductionDashboard: "Production Dashboard",
  };
  
  return titleMap[route.name as string] || "Dashboard";
});

function handleLogout() {
  logout();
  router.push("/login");
}
</script>

<template>
  <header class="app-header">
    <div class="page-title">
      <h1>{{ pageTitle }}</h1>
    </div>

    <div class="header-actions">
      <div class="action-btn">
        <Bell class="icon" />
      </div>

      <div class="user-profile">
        <div class="avatar">
          <User class="icon-small" />
        </div>
        <span class="username">{{ username }}</span>
      </div>

      <button @click="handleLogout" class="logout-btn" title="Logout">
        <LogOut class="icon" />
      </button>
    </div>
  </header>
</template>

<style scoped>
.app-header {
  height: 64px;
  background-color: #0f172a;
  border-bottom: 1px solid #1e293b;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 2rem;
  color: #e2e8f0;
}

.page-title h1 {
  font-size: 1.5rem;
  font-weight: 700;
  color: #e2e8f0;
  margin: 0;
  letter-spacing: -0.025em;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.action-btn {
  width: 2.5rem;
  height: 2.5rem;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: #94a3b8;
  transition: all 0.2s;
}

.action-btn:hover {
  background-color: #1e293b;
  color: #38bdf8;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.5rem 1rem;
  background-color: #1e293b;
  border-radius: 9999px;
  border: 1px solid #334155;
}

.avatar {
  width: 1.75rem;
  height: 1.75rem;
  background-color: #3b82f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.icon {
  width: 1.25rem;
  height: 1.25rem;
}

.icon-small {
  width: 1rem;
  height: 1rem;
  color: white;
}

.username {
  font-size: 0.875rem;
  font-weight: 600;
}

.logout-btn {
  background: none;
  border: none;
  cursor: pointer;
  color: #ef4444;
  padding: 0.5rem;
  border-radius: 0.5rem;
  transition: background-color 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logout-btn:hover {
  background-color: rgba(239, 68, 68, 0.1);
}
</style>
