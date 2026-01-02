// src/composables/useVisibility.ts
import { computed } from 'vue';
import { useAuth } from '@/stores/auth';
import { isDataItemVisible } from '@/modules/admin/services/visibilityService';
import { UserRole } from '@/modules/admin/types';

export function useVisibility(context?: { plantId?: string; machineId?: string }) {
  const { userRole } = useAuth();

  const currentRole = computed(() => {
    return (userRole.value as UserRole) || UserRole.VIEWER;
  });

  /**
   * Check if a data item should be visible
   * @param key - The data item key from DATA_ITEM_REGISTRY
   * @param overrideContext - Optional context override
   */
  function isVisible(key: string, overrideContext?: { plantId?: string; machineId?: string }): boolean {
    const ctx = overrideContext || context;
    return isDataItemVisible(currentRole.value, key, ctx);
  }

  /**
   * Computed visibility for a specific key
   * @param key - The data item key
   */
  function visibilityFor(key: string) {
    return computed(() => isVisible(key));
  }

  return {
    isVisible,
    visibilityFor,
    currentRole,
  };
}
