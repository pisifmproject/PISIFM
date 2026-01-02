import { createApp } from "vue";
import App from "./App.vue";
import router from "./router";
import { initializeVisibilityState, reloadVisibilityState } from "./modules/admin/services/visibilityService";

import "./assets/tailwind.css";
import "./style.css"; // kalau memang ada

const app = createApp(App);
app.use(router);

// Wait for router to be ready before mounting
router.isReady().then(async () => {
  // Check if user is already logged in (has token)
  const token = localStorage.getItem('auth_token');
  
  if (token) {
    // User is logged in, reload visibility state from database
    try {
      await reloadVisibilityState();
      console.log('Visibility state loaded from database');
    } catch (error) {
      console.warn('Failed to load visibility state:', error);
    }
  } else {
    // No user logged in, just initialize empty state
    try {
      await initializeVisibilityState();
    } catch (error) {
      console.warn('Failed to initialize visibility state:', error);
    }
  }
  
  app.mount("#app");
});
