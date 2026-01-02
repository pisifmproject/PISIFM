import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuth } from "../stores/auth";
import Login from "../modules/auth/views/Login.vue";
import Landing from "../views/Landing.vue";

// Layouts
import MainLayout from "../shared/layouts/MainLayout.vue";

// Global Views
import GlobalDashboard from "../modules/global/views/GlobalDashboard.vue";

// Plant Views
import PlantDashboard from "../modules/plant/views/PlantDashboard.vue";

// Energy Views
import ElectricalDashboard from "../modules/energy/views/ElectricalDashboard.vue";
import UtilitiesDashboard from "../modules/energy/views/UtilitiesDashboard.vue";
import LVMDPDetail from "../modules/energy/views/LVMDPDetail.vue";


// Production Views
import ProductionDashboard from "../modules/plant/views/ProductionDashboard.vue";
import MachineDetail from "../modules/plant/views/MachineDetail.vue";
import { PLANTS } from "@/config/app.config";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    name: "Landing",
    component: Landing,
    meta: { layout: 'blank' }
  },
  {
    path: "/login",
    name: "Login",
    component: Login,
    meta: { layout: 'blank' }
  },
  {
    path: "/",
    component: MainLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "global",
        name: "GlobalDashboard",
        component: GlobalDashboard
      },
      // Admin Routes
      {
        path: "admin",
        redirect: "/admin/visibility",
        children: [
          {
            path: "visibility",
            name: "VisibilityControl",
            component: () => import("../modules/admin/views/VisibilityControl.vue"),
            meta: { requiresAdmin: true }
          },
          {
            path: "users",
            name: "UserManagement",
            component: () => import("../modules/admin/views/UserManagement.vue"),
            meta: { requiresAdmin: true }
          }
        ]
      },
      // Plant Routes
      {
        path: "plant/:plantId",
        children: [
          {
            path: "",
            name: "PlantDashboard",
            component: PlantDashboard
          },
          // Energy Section
          {
            path: "energy",
            children: [
               { 
                 path: "", 
                 name: "UtilitiesDashboard",
                 component: UtilitiesDashboard 
               },
               {
                 path: "electricity",
                 name: "ElectricalDashboard",
                 component: ElectricalDashboard
               },
               {
                 path: "electricity/lvmdp/:lvmdpId",
                 name: "LVMDPDetail",
                 component: LVMDPDetail
               },

               // Shared Utility Detail View for all utility types
               {
                 path: "steam",
                 name: "SteamDetail",
                 component: () => import("../modules/energy/views/UtilityDetail.vue"),
                 props: { type: 'steam' }
               },
               {
                  path: "water",
                  name: "WaterDetail",
                  component: () => import("../modules/energy/views/UtilityDetail.vue"),
                  props: { type: 'water' }
               },
               {
                  path: "compressed-air",
                  name: "CompressedAirDetail",
                  component: () => import("../modules/energy/views/UtilityDetail.vue"),
                  props: { type: 'compressed-air' }
               },
               {
                  path: "nitrogen",
                  name: "NitrogenDetail",
                  component: () => import("../modules/energy/views/UtilityDetail.vue"),
                  props: { type: 'nitrogen' }
               },
               {
                  path: "gas",
                  name: "GasDetail",
                  component: () => import("../modules/energy/views/UtilityDetail.vue"),
                  props: { type: 'gas' }
               }
            ]
          },
          // Production Section
          {
            path: "production",
            children: [
              {
                path: "",
                name: "ProductionDashboard",
                component: ProductionDashboard
              },
              {
                path: "machine/:machineId",
                redirect: to => ({
                  name: "MachineDetailPerformance",
                  params: to.params
                })
              },
              {
                path: "machine/:machineId/performance",
                name: "MachineDetailPerformance",
                component: MachineDetail,
                meta: { tab: 'performance' }
              },
              {
                path: "machine/:machineId/process",
                name: "MachineDetailProcess",
                component: MachineDetail,
                meta: { tab: 'process' }
              },
              {
                path: "machine/:machineId/utility",
                name: "MachineDetailUtility",
                component: MachineDetail,
                meta: { tab: 'utility' }
              },
              {
                path: "machine/:machineId/packing",
                name: "MachineDetailPacking",
                component: MachineDetail,
                meta: { tab: 'packing' }
              },
              {
                path: "machine/:machineId/alarms",
                name: "MachineDetailAlarms",
                component: MachineDetail,
                meta: { tab: 'alarms' }
              },
              {
                path: "machine/:machineId/downtime",
                name: "MachineDetailDowntime",
                component: MachineDetail,
                meta: { tab: 'downtime' }
              },
              {
                path: "machine/:machineId/maintenance",
                name: "MachineDetailMaintenance",
                component: MachineDetail,
                meta: { tab: 'maintenance' }
              }
            ]
          }
        ],
        beforeEnter: (to, from, next) => {
          const plantId = to.params.plantId as string;
          if (PLANTS[plantId as keyof typeof PLANTS]) {
            next();
          } else {
            console.warn(`Plant ID ${plantId} not found, redirecting to global`);
            next('/global');
          }
        }
      }
    ]
  },
  // Catch all
  {
    path: "/:pathMatch(.*)*",
    redirect: "/global"
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, from, savedPosition) {
    return { top: 0 };
  }
});

router.beforeEach((to, from, next) => {
  const { isAuthenticated, initAuth, hasRole, canAccessPlant } = useAuth();
  
  // Ensure auth state is initialized
  initAuth();

  // Check if token exists
  const token = localStorage.getItem("auth_token");
  const hasValidAuth = isAuthenticated.value && token;

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!hasValidAuth) {
      // Clear any stale auth data
      localStorage.removeItem("auth_user");
      localStorage.removeItem("auth_token");
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      // Check admin permission
      if (to.matched.some(record => record.meta.requiresAdmin)) {
        if (!hasRole('ADMINISTRATOR')) {
          next('/global');
          return;
        }
      }
      
      // Check plant access permission
      const plantId = to.params.plantId as string;
      if (plantId && !canAccessPlant(plantId)) {
        console.warn(`Access denied to plant ${plantId}, redirecting to global`);
        next('/global');
        return;
      }
      
      next();
    }
  } else {
    // If going to login or landing while authenticated, go to global
    if ((to.name === 'Login' || to.name === 'Landing') && hasValidAuth) {
      next('/global');
      return;
    }
    next();
  }
});

export default router;
