// src/stores/auth.ts
import { ref, computed } from "vue";

export type UserRole = "tamu" | "user" | null;

interface User {
  username: string;
  role: UserRole;
}

const currentUser = ref<User | null>(null);
const sessionInitialized = ref(false);

// Hardcoded users
const users = [
  { username: "tamuifm", password: "hello01", role: "tamu" as UserRole },
  { username: "userifm", password: "pisifm00", role: "user" as UserRole },
];

// Clear auth on fresh page load (not from cache/history)
// This runs once when the module is first loaded
function clearAuthOnFreshLoad() {
  // Use sessionStorage to track if this is a fresh page load
  const isSessionActive = sessionStorage.getItem("session_active");
  
  if (!isSessionActive) {
    // Fresh page load - clear any stored auth
    localStorage.removeItem("auth_user");
    sessionStorage.setItem("session_active", "true");
  }
}

// Execute immediately when module loads
clearAuthOnFreshLoad();

export function useAuth() {
  const isAuthenticated = computed(() => currentUser.value !== null);
  const userRole = computed(() => currentUser.value?.role || null);
  const username = computed(() => currentUser.value?.username || "");

  function login(username: string, password: string): boolean {
    const user = users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      currentUser.value = {
        username: user.username,
        role: user.role,
      };
      // Save to localStorage for current session navigation
      localStorage.setItem("auth_user", JSON.stringify(currentUser.value));
      return true;
    }
    return false;
  }

  function logout() {
    currentUser.value = null;
    localStorage.removeItem("auth_user");
    sessionStorage.removeItem("session_active");
  }

  function initAuth() {
    if (sessionInitialized.value) return;
    
    const stored = localStorage.getItem("auth_user");
    if (stored) {
      try {
        currentUser.value = JSON.parse(stored);
      } catch (e) {
        localStorage.removeItem("auth_user");
      }
    }
    sessionInitialized.value = true;
  }

  function canAccessDailyReport(): boolean {
    return userRole.value === "user";
  }

  return {
    isAuthenticated,
    userRole,
    username,
    login,
    logout,
    initAuth,
    canAccessDailyReport,
  };
}
