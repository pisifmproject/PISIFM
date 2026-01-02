// src/composables/useVisibility.ts
import { computed, ref } from 'vue';
import { useAuth } from '@/stores/auth';
import { isDataItemVisible, initializeVisibilityState, visibilityVersion } from '@/modules/admin/services/visibilityService';
import { UserRole } from '@/modules/admin/types';

export function useVisibility(context?: { plantId?: string; machineId?: string }) {
  const { userRole } = useAuth();
  const isReady = ref(true); // Already initialized in main.ts

  const currentRole = computed(() => {
    return (userRole.value as UserRole) || UserRole.VIEWER;
  });

  /**
   * Check if a data item should be visible
   * @param key - The data item key from DATA_ITEM_REGISTRY
   * @param overrideContext - Optional context override
   */
  function isVisible(key: string, overrideContext?: { plantId?: string; machineId?: string }): boolean {
    // Access visibilityVersion to create reactive dependency
    const _ = visibilityVersion.value;
    const ctx = overrideContext || context;
    return isDataItemVisible(currentRole.value, key, ctx);
  }

  /**
   * Computed visibility for a specific key
   * @param key - The data item key
   */
  function visibilityFor(key: string) {
    return computed(() => {
      // Access visibilityVersion to create reactive dependency
      const _ = visibilityVersion.value;
      return isVisible(key);
    });
  }

  return {
    isVisible,
    visibilityFor,
    currentRole,
    isReady,
    visibilityVersion, // Export for components that need to watch changes
  };
}
