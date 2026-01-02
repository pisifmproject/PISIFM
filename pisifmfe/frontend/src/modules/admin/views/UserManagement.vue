<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { 
  Users, 
  Search, 
  Plus, 
  Edit2, 
  Trash2, 
  Shield, 
  X, 
  Check,
  Building 
} from 'lucide-vue-next';
import { 
  getUsers, 
  createUser, 
  updateUser, 
  deleteUser, 
  type UserData 
} from '@/lib/api';
import { PLANTS } from '@/config/app.config';

const users = ref<UserData[]>([]);
const isLoading = ref(false);
const searchQuery = ref('');
const isModalOpen = ref(false);
const isEditing = ref(false);
const showDeleteConfirm = ref(false);
const userToDelete = ref<number | null>(null);

// Form State
const formData = ref<UserData>({
  username: '',
  name: '',
  role: 'VIEWER',
  plantAccess: [],
  password: ''
});

const roles = [
  'ADMINISTRATOR',
  'SUPERVISOR',
  'OPERATOR',
  'MAINTENANCE',
  'QC',
  'MANAGEMENT',
  'VIEWER'
];

const availablePlants = Object.values(PLANTS);

// Fetch Users
async function loadUsers() {
  isLoading.value = true;
  try {
    const data = await getUsers();
    // Ensure data is array
    users.value = Array.isArray(data) ? data : (data.data || []);
  } catch (error) {
    console.error("Failed to load users", error);
  } finally {
    isLoading.value = false;
  }
}

// Filter Users
const filteredUsers = computed(() => {
  if (!searchQuery.value) return users.value;
  const lower = searchQuery.value.toLowerCase();
  return users.value.filter(u => 
    u.name.toLowerCase().includes(lower) || 
    u.username.toLowerCase().includes(lower) ||
    u.role.toLowerCase().includes(lower)
  );
});

// Modal Actions
function openAddModal() {
  isEditing.value = false;
  formData.value = {
    username: '',
    name: '',
    role: 'VIEWER',
    plantAccess: [],
    password: '' // Required for new user
  };
  isModalOpen.value = true;
}

function openEditModal(user: UserData) {
  isEditing.value = true;
  formData.value = { 
    ...user, 
    password: '' // Don't show existing password
  }; 
  isModalOpen.value = true;
}

function closeModal() {
  isModalOpen.value = false;
}

// Save User
async function saveUser() {
  try {
    if (isEditing.value && formData.value.id) {
      // Update - only send fields that should be updated
      const payload: Partial<UserData> = {
        name: formData.value.name,
        role: formData.value.role,
        plantAccess: formData.value.plantAccess,
      };
      
      // Only include password if it's not empty
      if (formData.value.password && formData.value.password.trim() !== '') {
        payload.password = formData.value.password;
      }
      
      await updateUser(formData.value.id, payload);
    } else {
      // Create - validate required fields
      if (!formData.value.username || !formData.value.password || !formData.value.name) {
        alert("Please fill in all required fields (Username, Password, Name)");
        return;
      }
      await createUser(formData.value);
    }
    await loadUsers();
    closeModal();
  } catch (error: any) {
    console.error("Failed to save user", error);
    const errorMsg = error.response?.data?.error || "Failed to save user";
    alert(errorMsg);
  }
}

// Delete Actions
function confirmDelete(id: number) {
  userToDelete.value = id;
  showDeleteConfirm.value = true;
}

async function handleDelete() {
  if (userToDelete.value) {
    try {
      await deleteUser(userToDelete.value);
      await loadUsers();
    } catch (error) {
      console.error("Failed to delete user", error);
    }
  }
  showDeleteConfirm.value = false;
  userToDelete.value = null;
}

// Helpers
function togglePlantAccess(plantId: string) {
  const index = formData.value.plantAccess.indexOf(plantId);
  if (index === -1) {
    formData.value.plantAccess.push(plantId);
  } else {
    formData.value.plantAccess.splice(index, 1);
  }
}

function getRoleColor(role: string) {
  switch (role) {
    case 'ADMINISTRATOR': return 'bg-blue-500/10 text-blue-400 border-blue-500/20';
    case 'SUPERVISOR': return 'bg-purple-500/10 text-purple-400 border-purple-500/20';
    case 'OPERATOR': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
    case 'MAINTENANCE': return 'bg-orange-500/10 text-orange-400 border-orange-500/20';
    default: return 'bg-slate-700 text-slate-300 border-slate-600';
  }
}

onMounted(() => {
  loadUsers();
});
</script>

<template>
  <div class="space-y-6 p-6">
    <!-- Header -->
    <div class="flex flex-col gap-2">
      <div class="flex items-center gap-3">
        <Users class="w-8 h-8 text-blue-500" />
        <h1 class="text-2xl font-bold text-white tracking-tight">User & Role Management</h1>
      </div>
      <p class="text-slate-400 max-w-3xl">
        Manage user accounts, assign roles, and set plant-level access permissions.
      </p>
    </div>

    <!-- Controls -->
    <div class="flex flex-col sm:flex-row justify-between items-center gap-4 bg-slate-800/50 p-4 rounded-xl border border-slate-700/50">
      <div class="relative w-full sm:w-96">
        <Search class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
        <input 
          v-model="searchQuery"
          type="text" 
          placeholder="Search by name or ID..."
          class="w-full bg-slate-900 border border-slate-700 text-slate-200 pl-10 pr-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 placeholder:text-slate-600"
        >
      </div>
      <button 
        @click="openAddModal"
        class="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-lg font-medium transition-colors"
      >
        <Plus class="w-4 h-4" />
        <span>Add New User</span>
      </button>
    </div>

    <!-- Users Table -->
    <div class="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="border-b border-slate-700/50 text-xs text-slate-400 uppercase tracking-wider font-semibold">
              <th class="p-4">Full Name</th>
              <th class="p-4">Corporate ID (Username)</th>
              <th class="p-4">Role</th>
              <th class="p-4">Plant Access</th>
              <th class="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-700/50">
            <tr v-if="isLoading" class="animate-pulse">
              <td colspan="5" class="p-8 text-center text-slate-500">Loading users...</td>
            </tr>
            <tr v-else-if="filteredUsers.length === 0">
              <td colspan="5" class="p-8 text-center text-slate-500">No users found</td>
            </tr>
            <tr 
              v-for="user in filteredUsers" 
              :key="user.id"
              class="hover:bg-slate-700/30 transition-colors"
            >
              <td class="p-4 font-medium text-slate-200">{{ user.name }}</td>
              <td class="p-4 text-slate-400 font-mono text-sm">{{ user.username }}</td>
              <td class="p-4">
                <span 
                  class="px-2.5 py-1 rounded-md text-xs font-semibold border"
                  :class="getRoleColor(user.role)"
                >
                  {{ user.role }}
                </span>
              </td>
              <td class="p-4">
                <div class="flex flex-wrap gap-1.5">
                  <span 
                    v-if="user.role === 'ADMINISTRATOR'" 
                    class="text-xs text-green-400 font-medium tracking-wide uppercase"
                  >
                    All Systems
                  </span>
                  <template v-else>
                    <span 
                      v-if="user.plantAccess?.length === 0" 
                      class="text-xs text-slate-500 italic"
                    >
                      No Access
                    </span>
                    <span 
                      v-for="plantId in user.plantAccess" 
                      :key="plantId"
                      class="px-2 py-0.5 rounded bg-slate-700 text-slate-300 text-[10px] border border-slate-600 uppercase"
                    >
                      {{ PLANTS[plantId as keyof typeof PLANTS]?.name || plantId }}
                    </span>
                  </template>
                </div>
              </td>
              <td class="p-4 text-right">
                <div class="flex items-center justify-end gap-2">
                  <button 
                    @click="openEditModal(user)"
                    class="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-400 transition-colors"
                    title="Edit User"
                  >
                    <Edit2 class="w-4 h-4" />
                  </button>
                  <button 
                    @click="confirmDelete(user.id!)"
                    class="p-2 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-400 transition-colors"
                    title="Delete User"
                    :disabled="user.role === 'ADMINISTRATOR' && user.username === 'admin'" 
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal (Create/Edit) -->
    <Transition name="fade">
      <div v-if="isModalOpen" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
          <!-- Header -->
          <div class="p-6 border-b border-slate-800 flex justify-between items-center bg-slate-800/30">
            <h3 class="text-lg font-semibold text-white">
              {{ isEditing ? 'Edit User' : 'Add New User' }}
            </h3>
            <button @click="closeModal" class="text-slate-400 hover:text-white">
              <X class="w-5 h-5" />
            </button>
          </div>

          <!-- Body -->
          <div class="p-6 overflow-y-auto space-y-6">
            <!-- Basic Info -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase">Full Name</label>
                <input 
                  v-model="formData.name"
                  type="text" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  placeholder="e.g. John Doe"
                />
              </div>
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase">Username / Corporate ID</label>
                <input 
                  v-model="formData.username"
                  type="text" 
                  :disabled="isEditing"
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none disabled:opacity-50"
                  placeholder="e.g. jdoe"
                />
              </div>
            </div>

            <!-- Role & Auth -->
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase">Role</label>
                <div class="relative">
                  <select 
                    v-model="formData.role"
                    class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none appearance-none"
                  >
                    <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
                  </select>
                  <div class="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg>
                  </div>
                </div>
              </div>

               <div class="space-y-2">
                <label class="text-xs font-medium text-slate-400 uppercase">
                  Password {{ isEditing ? '(Leave blank to keep current)' : '' }}
                </label>
                <input 
                  v-model="formData.password"
                  type="password" 
                  class="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:border-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <!-- Plant Access -->
            <div class="space-y-2" v-if="formData.role !== 'ADMINISTRATOR'">
              <label class="text-xs font-medium text-slate-400 uppercase block mb-2">Plant Access Permissions</label>
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div 
                  v-for="plant in availablePlants" 
                  :key="plant.id"
                  @click="togglePlantAccess(plant.id)"
                  class="flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all"
                  :class="formData.plantAccess.includes(plant.id) 
                    ? 'bg-blue-500/10 border-blue-500/50 text-blue-100' 
                    : 'bg-slate-950 border-slate-700 text-slate-400 hover:border-slate-600'"
                >
                  <div 
                    class="w-5 h-5 rounded flex items-center justify-center border transition-colors"
                    :class="formData.plantAccess.includes(plant.id) 
                      ? 'bg-blue-500 border-blue-500 text-white' 
                      : 'border-slate-600'"
                  >
                    <Check v-if="formData.plantAccess.includes(plant.id)" class="w-3.5 h-3.5" />
                  </div>
                  <span class="text-sm font-medium">{{ plant.name }}</span>
                </div>
              </div>
            </div>
            <div v-else class="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg text-blue-200 text-sm flex items-center gap-2">
                <Shield class="w-4 h-4" />
                <span>Administrators have full access to all plants and settings.</span>
            </div>

          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-slate-800 bg-slate-800/30 flex justify-end gap-3">
            <button 
              @click="closeModal"
              class="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
            >
              Cancel
            </button>
            <button 
              @click="saveUser"
              class="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-blue-500/20"
            >
              {{ isEditing ? 'Save Changes' : 'Create User' }}
            </button>
          </div>
        </div>
      </div>
    </Transition>

    <!-- Delete Confirmation Modal -->
    <Transition name="fade">
      <div v-if="showDeleteConfirm" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
        <div class="bg-slate-900 border border-slate-700 rounded-xl shadow-2xl w-full max-w-md p-6">
           <div class="flex items-center gap-3 text-red-500 mb-4">
             <div class="p-3 bg-red-500/10 rounded-full">
               <Trash2 class="w-6 h-6" />
             </div>
             <h3 class="text-lg font-bold text-white">Delete User?</h3>
           </div>
           <p class="text-slate-400 mb-6">
             Are you sure you want to delete this user? This action cannot be undone.
           </p>
           <div class="flex justify-end gap-3">
             <button 
               @click="showDeleteConfirm = false"
               class="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg text-sm font-medium transition-colors"
             >
               Cancel
             </button>
             <button 
               @click="handleDelete"
               class="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-sm font-medium transition-colors shadow-lg shadow-red-500/20"
             >
               Delete User
             </button>
           </div>
        </div>
      </div>
    </Transition>

  </div>
</template>

<style scoped>
/* Scoped styles mainly for specific overrides if Tailwind is not enough */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
