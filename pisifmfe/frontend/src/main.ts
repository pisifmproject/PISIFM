import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeVisibilityState } from "./modules/admin/services/visibilityService";

import "./assets/tailwind.css";
import "./style.css"; // kalau memang ada

const app = createApp(App);
app.use(router);

// Wait for router to be ready before mounting
router.isReady().then(async () => {
  // Initialize visibility state from database
  try {
    await initializeVisibilityState();
  } catch (error) {
    console.warn('Failed to initialize visibility state:', error);
  }
  
  app.mount("#app");
});
