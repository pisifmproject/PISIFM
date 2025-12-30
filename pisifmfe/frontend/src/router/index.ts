import { createRouter, createWebHistory, type RouteRecordRaw } from "vue-router";
import { useAuth } from "../stores/auth";
import Login from "../modules/auth/views/Login.vue";

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
import SteamDetail from "../modules/energy/views/SteamDetail.vue";
import WaterDetail from "../modules/energy/views/WaterDetail.vue";
import CompressedAirDetail from "../modules/energy/views/CompressedAirDetail.vue";
import NitrogenDetail from "../modules/energy/views/NitrogenDetail.vue";
import GasDetail from "../modules/energy/views/GasDetail.vue";

// Production Views
import ProductionDashboard from "../modules/plant/views/ProductionDashboard.vue";
import MachineDetail from "../modules/plant/views/MachineDetail.vue";
import { PLANTS } from "@/config/app.config";

const routes: RouteRecordRaw[] = [
  {
    path: "/",
    redirect: "/login"
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
               {
                 path: "steam",
                 name: "SteamDetail",
                 component: SteamDetail
               },
               {
                  path: "water",
                  name: "WaterDetail",
                  component: WaterDetail
               },
               {
                  path: "compressed-air",
                  name: "CompressedAirDetail",
                  component: CompressedAirDetail
               },
               {
                  path: "nitrogen",
                  name: "NitrogenDetail",
                  component: NitrogenDetail
               },
               {
                  path: "gas",
                  name: "GasDetail",
                  component: GasDetail
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
                name: "MachineDetail",
                component: MachineDetail
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
  const { isAuthenticated, initAuth } = useAuth();
  
  // Ensure auth state is initialized
  initAuth();

  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      next({ name: "Login", query: { redirect: to.fullPath } });
    } else {
      next();
    }
  } else {
    // If going to login while authenticated, go to global
    if (to.name === 'Login' && isAuthenticated.value) {
      next('/global');
      return;
    }
    next();
  }
});

export default router;
