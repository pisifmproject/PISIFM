// src/stores/auth.ts
import { ref, computed } from "vue";
import { loginApi, type LoginResponse } from "@/lib/api";

export type UserRole = 
  | "ADMINISTRATOR" 
  | "SUPERVISOR" 
  | "OPERATOR" 
  | "MAINTENANCE" 
  | "QC" 
  | "MANAGEMENT" 
  | "VIEWER" 
  | null;

interface User {
  id: number;
  username: string;
  name: string | null;
  role: UserRole;
  plantAccess: string[] | null;
}

const currentUser = ref<User | null>(null);
const sessionInitialized = ref(false);
const isLoading = ref(false);
const loginError = ref<string | null>(null);

// Clear auth on fresh page load (not from cache/history)
function clearAuthOnFreshLoad() {
  const isSessionActive = sessionStorage.getItem("session_active");
  
  if (!isSessionActive) {
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    sessionStorage.setItem("session_active", "true");
  }
}

clearAuthOnFreshLoad();

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null);
  const userRole = computed(() => currentUser.value?.role || null);
  const username = computed(() => currentUser.value?.username || "");
  const userName = computed(() => currentUser.value?.name || "");
  const plantAccess = computed(() => currentUser.value?.plantAccess || []);

  async function login(username: string, password: string): Promise<{ success: boolean; error?: string }> {
    isLoading.value = true;
    loginError.value = null;

    try {
      const response: LoginResponse = await loginApi(username, password);

      if (response.success && response.user && response.token) {
        currentUser.value = {
          id: response.user.id,
          username: response.user.username,
          name: response.user.name,
          role: response.user.role as UserRole,
          plantAccess: response.user.plantAccess,
        };
        
        localStorage.setItem("auth_user", JSON.stringify(currentUser.value));
        localStorage.setItem("auth_token", response.token);
        
        return { success: true };
      }

      return { success: false, error: response.message || "Login failed" };
    } catch (error: any) {
      const errorMessage = error.response?.data?.error || "User not found";
      loginError.value = errorMessage;
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("auth_user");
    localStorage.removeItem("auth_token");
    sessionStorage.removeItem("session_active");
  }

  function initAuth() {
    if (sessionInitialized.value) return;
    
    const stored = localStorage.getItem("auth_user");
    const token = localStorage.getItem("auth_token");
    
    if (stored && token) {
      try {
        currentUser.value = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem("auth_user");
        localStorage.removeItem("auth_token");
      }
    }
    sessionInitialized.value = true;
  }

  function hasRole(...roles: UserRole[]): boolean {
    return roles.includes(userRole.value);
  }

  function canAccessPlant(plantId: string): boolean {
    if (!currentUser.value) return false;
    if (hasRole("ADMINISTRATOR", "MANAGEMENT")) return true;
    return plantAccess.value.includes(plantId);
  }

  // Role-based access helpers
  const canViewDashboard = computed(() => isAuthenticated.value);
  const canViewReports = computed(() => hasRole("ADMINISTRATOR", "SUPERVISOR", "MANAGEMENT", "QC"));
  const canEditSettings = computed(() => hasRole("ADMINISTRATOR"));
  const canManageUsers = computed(() => hasRole("ADMINISTRATOR"));

  return {
    isAuthenticated,
    userRole,
    username,
    userName,
    plantAccess,
    isLoading: computed(() => isLoading.value),
    loginError: computed(() => loginError.value),
    login,
    logout,
    initAuth,
    hasRole,
    canAccessPlant,
    canViewDashboard,
    canViewReports,
    canEditSettings,
    canManageUsers,
  };
}
