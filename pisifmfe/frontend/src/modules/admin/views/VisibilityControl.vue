<script setup lang="ts">
import { ref, computed, watch, onMounted } from 'vue';
import { 
  Eye, 
  EyeOff, 
  ChevronDown, 
  ChevronRight,
  LayoutDashboard,
  Factory,
  Zap,
  Settings,
  Search,
  RotateCcw,
  Loader2,
  User,
  Users
} from 'lucide-vue-next';
import { 
  DATA_ITEM_REGISTRY,
  updateVisibilityRule,
  getVisibilityRulesForRoleAndScope,
  getScopeKeyForSettings,
  isDataItemVisible,
  initializeVisibilityState,
  resetVisibilitySettings
} from '../services/visibilityService';
import { UserRole, VisibilityCategory, VisibilityGroup, type DataItem } from '../types';
import { plantService } from '../services/plantService';
import { api } from '@/lib/api';

// Types
interface AppUser {
  id: number;
  username: string;
  corporateId: string;
  name: string | null;
  role: string;
}

// State
const selectedMode = ref<'role' | 'user'>('role');
const selectedRole = ref<UserRole>(UserRole.SUPERVISOR);
const selectedUserRole = ref<UserRole>(UserRole.SUPERVISOR); // Role filter for user mode
const selectedUserId = ref<number | null>(null);
const selectedPlant = ref<string>('ALL_PLANTS');
const searchQuery = ref('');
const expandedCategories = ref<Set<string>>(new Set(['GLOBAL_DASHBOARD', 'PLANT_DASHBOARD']));
const expandedGroups = ref<Set<string>>(new Set());
const isLoading = ref(true);
const isSaving = ref(false);
const users = ref<AppUser[]>([]);

// Fetch users
async function fetchUsers() {
  try {
    const response = await api.get('/users');
    // Sort by name (A-Z) then by ID (ascending)
    users.value = response.data
      .filter((u: AppUser) => u.role !== 'ADMINISTRATOR')
      .sort((a: AppUser, b: AppUser) => {
        const nameA = (a.name || a.username).toLowerCase();
        const nameB = (b.name || b.username).toLowerCase();
        if (nameA !== nameB) return nameA.localeCompare(nameB);
        return a.id - b.id;
      });
  } catch (error) {
    console.error('Failed to fetch users:', error);
  }
}

// Computed: users filtered by selected role
const filteredUsersByRole = computed(() => {
  return users.value.filter(u => u.role === selectedRole.value);
});

// Watch for role change - reset selected user
watch(selectedRole, () => {
  selectedUserId.value = null;
});

// Computed: effective role for visibility check
const effectiveRole = computed(() => {
  if (selectedUserId.value) {
    const user = users.value.find(u => u.id === selectedUserId.value);
    return user?.role as UserRole || UserRole.VIEWER;
  }
  return selectedRole.value;
});

// Computed: effective target key (role or user:id)
const effectiveTargetKey = computed(() => {
  if (selectedUserId.value) {
    return `USER:${selectedUserId.value}`;
  }
  return selectedRole.value;
});

// Data
const roles = Object.values(UserRole).filter(r => r !== UserRole.ADMINISTRATOR);
const plants = [
  { id: 'ALL_PLANTS', name: 'All Plants (Default)' },
  ...plantService.getAllPlants()
];

// Category labels
const categoryLabels: Record<VisibilityCategory, string> = {
  [VisibilityCategory.GLOBAL_DASHBOARD]: 'Global Dashboard',
  [VisibilityCategory.PLANT_DASHBOARD]: 'Plant Dashboard',
  [VisibilityCategory.UTILITY]: 'Utility Dashboard',
  [VisibilityCategory.MAIN_PANEL_1]: 'LVMDP Panel 1',
  [VisibilityCategory.MAIN_PANEL_2]: 'LVMDP Panel 2',
  [VisibilityCategory.MAIN_PANEL_3]: 'LVMDP Panel 3',
  [VisibilityCategory.MAIN_PANEL_4]: 'LVMDP Panel 4',
  [VisibilityCategory.MACHINE_DETAIL]: 'Machine Detail',
};

// Group labels
const groupLabels: Record<VisibilityGroup, string> = {
  [VisibilityGroup.KPI]: 'KPI Cards',
  [VisibilityGroup.CHART]: 'Charts',
  [VisibilityGroup.TABLE]: 'Tables',
  [VisibilityGroup.LIST]: 'Lists',
  [VisibilityGroup.STATUS]: 'Status Indicators',
  [VisibilityGroup.TAB]: 'Tabs',
  [VisibilityGroup.FORM]: 'Forms',
  [VisibilityGroup.OUTPUT]: 'Output Metrics',
  [VisibilityGroup.OEE]: 'OEE Metrics',
  [VisibilityGroup.MACHINES]: 'Machine Cards',
  [VisibilityGroup.UTILITY_CONSUMPTION]: 'Utility Consumption',
  [VisibilityGroup.PROCESS_PARAM]: 'Process Parameters',
  [VisibilityGroup.ALARM_DATA]: 'Alarm Data',
  [VisibilityGroup.PACKING_LINE_KPI]: 'Packing Line KPIs',
  [VisibilityGroup.PACKING_WEIGHER]: 'Weigher Metrics',
  [VisibilityGroup.PACKING_BAGMAKER]: 'Bagmaker Metrics',
};

// Category icons
const categoryIcons: Record<VisibilityCategory, any> = {
  [VisibilityCategory.GLOBAL_DASHBOARD]: LayoutDashboard,
  [VisibilityCategory.PLANT_DASHBOARD]: Factory,
  [VisibilityCategory.UTILITY]: Zap,
  [VisibilityCategory.MAIN_PANEL_1]: Zap,
  [VisibilityCategory.MAIN_PANEL_2]: Zap,
  [VisibilityCategory.MAIN_PANEL_3]: Zap,
  [VisibilityCategory.MAIN_PANEL_4]: Zap,
  [VisibilityCategory.MACHINE_DETAIL]: Settings,
};

// Computed: Group items by category and group
const groupedItems = computed(() => {
  const result: Record<string, Record<string, DataItem[]>> = {};
  
  let items = DATA_ITEM_REGISTRY;
  
  // Filter by plant scope
  if (selectedPlant.value !== 'ALL_PLANTS') {
    items = items.filter(item => 
      !item.plantScopeId || item.plantScopeId === selectedPlant.value
    );
  }

  // Filter by search
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    items = items.filter(item => 
      item.label.toLowerCase().includes(query) ||
      item.key.toLowerCase().includes(query) ||
      item.location.toLowerCase().includes(query)
    );
  }
  
  items.forEach(item => {
    if (!result[item.category]) {
      result[item.category] = {};
    }
    if (!result[item.category][item.group]) {
      result[item.category][item.group] = [];
    }
    result[item.category][item.group].push(item);
  });
  
  return result;
});

// Reactive Rules State
const currentRules = ref<Record<string, boolean>>({});

// Load rules when context changes
const loadRules = () => {
  // Logic to refresh rules if needed
};

// Auto-reset to defaults on mount if things look empty or weird (User Request)
onMounted(async () => {
  isLoading.value = true;
  try {
    // Fetch users list
    await fetchUsers();
    // Initialize visibility state from database
    await initializeVisibilityState();
  } catch (error) {
    console.error('Failed to initialize visibility state:', error);
  } finally {
    isLoading.value = false;
    updateTrigger.value++;
  }
});

// Alternative: Use a counter to force update
const updateTrigger = ref(0);

// Get current visibility state for an item
function getItemVisibility(item: DataItem): boolean {
  // Dependency on trigger
  updateTrigger.value;
  
  const context = {
    category: item.category,
    plantId: selectedPlant.value === 'ALL_PLANTS' ? undefined : selectedPlant.value
  };
  const scopeKey = getScopeKeyForSettings(context);
  const rules = getVisibilityRulesForRoleAndScope(effectiveTargetKey.value, scopeKey);
  
  if (rules[item.key] !== undefined) {
    return rules[item.key];
  }
  // User requested default is show all components
  return true;
}

// Toggle visibility
async function toggleVisibility(item: DataItem) {
  const currentValue = getItemVisibility(item);
  const context = {
    category: item.category,
    plantId: selectedPlant.value === 'ALL_PLANTS' ? undefined : selectedPlant.value
  };
  
  isSaving.value = true;
  try {
    await updateVisibilityRule(effectiveTargetKey.value, context, item.key, !currentValue);
    updateTrigger.value++; // Force re-render after successful save
    console.log(`Toggle successful: ${item.key} = ${!currentValue}`);
  } catch (error) {
    console.error('Failed to toggle visibility:', error);
    alert(`Failed to update visibility for ${item.label}. Please try again.`);
    updateTrigger.value++; // Force re-render to show reverted state
  } finally {
    isSaving.value = false;
  }
}

// Toggle category expansion
function toggleCategory(category: string) {
  if (expandedCategories.value.has(category)) {
    expandedCategories.value.delete(category);
  } else {
    expandedCategories.value.add(category);
  }
}

// Toggle group expansion
function toggleGroup(categoryGroup: string) {
  if (expandedGroups.value.has(categoryGroup)) {
    expandedGroups.value.delete(categoryGroup);
  } else {
    expandedGroups.value.add(categoryGroup);
  }
}

// Reset all visibility for current role/scope
async function resetToDefaults() {
  if (!confirm('Reset all visibility settings to defaults for this role and scope?')) return;
  
  isLoading.value = true;
  try {
    await resetVisibilitySettings();
    updateTrigger.value++;
  } catch (error) {
    console.error('Failed to reset visibility settings:', error);
    alert('Failed to reset visibility settings. Please try again.');
  } finally {
    isLoading.value = false;
  }
}

// Count visible/total items in category
function getCategoryStats(category: string): { visible: number; total: number } {
  updateTrigger.value; // Reactivity
  const groups = groupedItems.value[category];
  if (!groups) return { visible: 0, total: 0 };
  
  let visible = 0;
  let total = 0;
  
  Object.values(groups).forEach(items => {
    items.forEach(item => {
      total++;
      if (getItemVisibility(item)) visible++;
    });
  });
  
  return { visible, total };
}

// Count visible/total items in group
function getGroupStats(category: string, group: string): { visible: number; total: number } {
  updateTrigger.value; // Reactivity
  const items = groupedItems.value[category]?.[group] || [];
  let visible = 0;
  
  items.forEach(item => {
    if (getItemVisibility(item)) visible++;
  });
  
  return { visible, total: items.length };
}

// Toggle all items in a group
async function toggleAllInGroup(category: string, group: string, visible: boolean) {
  const items = groupedItems.value[category]?.[group] || [];
  isSaving.value = true;
  
  let successCount = 0;
  let failCount = 0;
  
  try {
    for (const item of items) {
      const context = {
        category: item.category,
        plantId: selectedPlant.value === 'ALL_PLANTS' ? undefined : selectedPlant.value
      };
      try {
        await updateVisibilityRule(effectiveTargetKey.value, context, item.key, visible);
        successCount++;
      } catch (error) {
        console.error(`Failed to update ${item.key}:`, error);
        failCount++;
      }
    }
    updateTrigger.value++;
    
    if (failCount > 0) {
      alert(`Updated ${successCount} items, ${failCount} failed. Please try again for failed items.`);
    }
  } catch (error) {
    console.error('Failed to toggle group visibility:', error);
  } finally {
    isSaving.value = false;
  }
}
</script>

<template>
  <div class="visibility-control">
    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <Loader2 class="w-8 h-8 text-blue-500 animate-spin" />
      <span class="text-slate-400">Loading visibility settings...</span>
    </div>

    <!-- Saving Indicator -->
    <div v-if="isSaving" class="saving-indicator">
      <Loader2 class="w-4 h-4 text-blue-500 animate-spin" />
      <span>Saving...</span>
    </div>

    <!-- Header -->
    <div class="header">
      <div class="header-content">
        <div class="flex items-center gap-3">
          <Eye class="w-8 h-8 text-blue-500" />
          <div>
            <h1 class="text-2xl font-bold text-white">Visibility Control</h1>
            <p class="text-slate-400 text-sm">Configure which data items are visible for each role</p>
          </div>
        </div>
        
        <button @click="resetToDefaults" class="reset-btn">
          <RotateCcw class="w-4 h-4" />
          <span>Reset to Defaults</span>
        </button>
      </div>
    </div>

    <!-- Filters -->
    <div class="filters">
      <!-- Role Select (Always visible now) -->
      <div class="filter-group">
        <label class="filter-label">Role</label>
        <select v-model="selectedRole" class="filter-select">
          <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
        </select>
      </div>

      <!-- User Select (Optional Override) -->
      <div class="filter-group">
        <label class="filter-label">User (Optional)</label>
        <select v-model="selectedUserId" class="filter-select user-select" :disabled="filteredUsersByRole.length === 0">
          <option :value="null">All {{ selectedRole }} Users (Default)</option>
          <option v-for="user in filteredUsersByRole" :key="user.id" :value="user.id">
            {{ user.name || user.username }}
          </option>
          <option v-if="filteredUsersByRole.length === 0" disabled>No users found</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Scope</label>
        <select v-model="selectedPlant" class="filter-select">
          <option v-for="plant in plants" :key="plant.id" :value="plant.id">{{ plant.name }}</option>
        </select>
      </div>
      
      <div class="filter-group flex-1">
        <label class="filter-label">Search</label>
        <div class="search-input">
          <Search class="w-4 h-4 text-slate-500" />
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Search items..."
            class="search-field"
          />
        </div>
      </div>
    </div>

    <!-- Admin Notice -->
    <div v-if="selectedRole === UserRole.ADMINISTRATOR" class="admin-notice">
      <Eye class="w-5 h-5" />
      <span>Administrator role always sees all items. Select a different role to configure visibility.</span>
    </div>

    <!-- Categories -->
    <div class="categories">
      <div 
        v-for="(groups, category) in groupedItems" 
        :key="category"
        class="category-section"
      >
        <!-- Category Header -->
        <div 
          class="category-header"
          @click="toggleCategory(category)"
        >
          <div class="category-left">
            <component 
              :is="expandedCategories.has(category) ? ChevronDown : ChevronRight" 
              class="w-5 h-5 text-slate-500"
            />
            <component 
              :is="categoryIcons[category as VisibilityCategory]" 
              class="w-5 h-5 text-blue-400"
            />
            <span class="category-name">{{ categoryLabels[category as VisibilityCategory] }}</span>
          </div>
          <div class="category-stats">
            <span class="stats-text">
              {{ getCategoryStats(category).visible }} / {{ getCategoryStats(category).total }} visible
            </span>
          </div>
        </div>

        <!-- Category Content -->
        <div v-if="expandedCategories.has(category)" class="category-content">
          <div 
            v-for="(items, group) in groups" 
            :key="`${category}-${group}`"
            class="group-section"
          >
            <!-- Group Header -->
            <div 
              class="group-header"
              @click="toggleGroup(`${category}-${group}`)"
            >
              <div class="group-left">
                <component 
                  :is="expandedGroups.has(`${category}-${group}`) ? ChevronDown : ChevronRight" 
                  class="w-4 h-4 text-slate-600"
                />
                <span class="group-name">{{ groupLabels[group as VisibilityGroup] || group }}</span>
                <span class="group-count">({{ items.length }})</span>
              </div>
              <div class="group-actions">
                <button 
                  @click.stop="toggleAllInGroup(category, group, true)"
                  class="group-action-btn show"
                  title="Show All"
                >
                  <Eye class="w-3.5 h-3.5" />
                </button>
                <button 
                  @click.stop="toggleAllInGroup(category, group, false)"
                  class="group-action-btn hide"
                  title="Hide All"
                >
                  <EyeOff class="w-3.5 h-3.5" />
                </button>
                <span class="group-stats">
                  {{ getGroupStats(category, group).visible }}/{{ getGroupStats(category, group).total }}
                </span>
              </div>
            </div>

            <!-- Group Items -->
            <div v-if="expandedGroups.has(`${category}-${group}`)" class="group-items">
              <div 
                v-for="item in items" 
                :key="item.id"
                class="item-row"
                :class="{ 'item-hidden': !getItemVisibility(item) }"
              >
                <div class="item-info">
                  <span class="item-label">{{ item.label }}</span>
                  <span class="item-location">{{ item.location }}</span>
                </div>
                <button 
                  @click="toggleVisibility(item)"
                  class="toggle-switch"
                  :class="{ 'toggled-on': getItemVisibility(item) }"
                  role="switch"
                  :aria-checked="getItemVisibility(item) ? 'true' : 'false'"
                >
                  <span class="toggle-track"></span>
                  <span class="toggle-thumb"></span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.visibility-control {
  padding: 1.5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.header {
  margin-bottom: 1.5rem;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.reset-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s;
}

.reset-btn:hover {
  background: #334155;
  color: white;
}

.filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background: #1e293b;
  border-radius: 0.75rem;
  border: 1px solid #334155;
  flex-wrap: wrap;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.filter-label {
  font-size: 0.7rem;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.mode-toggle {
  display: flex;
  gap: 0.25rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  padding: 0.25rem;
}

.mode-btn {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.375rem 0.75rem;
  background: transparent;
  border: none;
  border-radius: 0.375rem;
  color: #64748b;
  font-size: 0.8rem;
  cursor: pointer;
  transition: all 0.2s;
}

.mode-btn:hover {
  color: #94a3b8;
}

.mode-btn.active {
  background: #3b82f6;
  color: white;
}

.filter-select {
  padding: 0.5rem 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #e2e8f0;
  font-size: 0.875rem;
  min-width: 180px;
}

.filter-select.user-select {
  min-width: 280px;
}

.search-input {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: #0f172a;
  border: 1px solid #334155;
  border-radius: 0.5rem;
}

.search-field {
  background: transparent;
  border: none;
  color: #e2e8f0;
  font-size: 0.875rem;
  outline: none;
  width: 100%;
}

.admin-notice {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.3);
  border-radius: 0.5rem;
  color: #60a5fa;
  font-size: 0.875rem;
  margin-bottom: 1.5rem;
}

.categories {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.category-section {
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.75rem;
  overflow: hidden;
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.25rem;
  cursor: pointer;
  transition: background 0.2s;
}

.category-header:hover {
  background: rgba(255, 255, 255, 0.02);
}

.category-left {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.category-name {
  font-weight: 600;
  color: white;
  font-size: 0.95rem;
}

.category-stats {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stats-text {
  font-size: 0.8rem;
  color: #64748b;
}

.category-content {
  border-top: 1px solid #334155;
  padding: 0.5rem;
}

.group-section {
  margin-bottom: 0.25rem;
}

.group-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background: rgba(0, 0, 0, 0.2);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background 0.2s;
}

.group-header:hover {
  background: rgba(0, 0, 0, 0.3);
}

.group-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-name {
  font-size: 0.85rem;
  color: #cbd5e1;
  font-weight: 500;
}

.group-count {
  font-size: 0.75rem;
  color: #64748b;
}

.group-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.group-action-btn {
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.group-action-btn.show {
  background: rgba(34, 197, 94, 0.1);
  color: #4ade80;
}

.group-action-btn.show:hover {
  background: rgba(34, 197, 94, 0.2);
}

.group-action-btn.hide {
  background: rgba(239, 68, 68, 0.1);
  color: #f87171;
}

.group-action-btn.hide:hover {
  background: rgba(239, 68, 68, 0.2);
}

.group-stats {
  font-size: 0.75rem;
  color: #64748b;
  min-width: 40px;
  text-align: right;
}

.group-items {
  padding: 0.5rem 0.5rem 0.5rem 2rem;
}

.item-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.625rem 1rem;
  border-radius: 0.375rem;
  transition: background 0.2s;
}

.item-row:hover {
  background: rgba(255, 255, 255, 0.02);
}

.item-row.item-hidden {
  opacity: 0.7;
}

.item-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.item-label {
  font-size: 0.875rem;
  color: #e2e8f0;
}

.item-location {
  font-size: 0.7rem;
  color: #64748b;
}

/* Toggle Switch Styles */
.toggle-switch {
  position: relative;
  width: 44px;
  height: 24px;
  background-color: #334155;
  border-radius: 9999px;
  border: none;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out;
  flex-shrink: 0;
}

.toggle-switch:focus-visible {
  outline: 2px solid #3b82f6;
  outline-offset: 2px;
}

.toggle-switch.toggled-on {
  background-color: #3b82f6;
}

.toggle-thumb {
  position: absolute;
  top: 2px;
  left: 2px;
  width: 20px;
  height: 20px;
  background-color: white;
  border-radius: 50%;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
  transition: transform 0.2s ease-in-out;
}

.toggle-switch.toggled-on .toggle-thumb {
  transform: translateX(20px);
}

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
  }
  
  .filter-select {
    min-width: 100%;
  }
  
  .header-content {
    flex-direction: column;
    gap: 1rem;
  }
}

.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(15, 23, 42, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  z-index: 100;
}

.saving-indicator {
  position: fixed;
  top: 1rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #1e293b;
  border: 1px solid #334155;
  border-radius: 0.5rem;
  color: #94a3b8;
  font-size: 0.875rem;
  z-index: 50;
}

.animate-spin {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
