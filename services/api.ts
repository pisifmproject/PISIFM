import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Proxy will handle this
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth Service
export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post("/auth/login", { email, password });
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("authToken", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
  register: async (userData: {
    name: string;
    email: string;
    password: string;
    role: string;
  }) => {
    const response = await api.post("/auth/register", userData);
    if (response.data.success && response.data.data.token) {
      localStorage.setItem("authToken", response.data.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("authToken");
    localStorage.removeItem("user");
  },
  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
  isAuthenticated: () => {
    return !!localStorage.getItem("authToken");
  },
};

export const projectService = {
  getAll: async () => {
    const response = await api.get("/projects");
    return response.data;
  },
  create: async (project: any) => {
    const response = await api.post("/projects", project);
    return response.data;
  },
  update: async (id: string, project: any) => {
    const response = await api.put(`/projects/${id}`, project);
    return response.data;
  },
};

export const userService = {
  getAll: async () => {
    const response = await api.get("/users");
    return response.data;
  },
  update: async (id: string, user: any) => {
    const response = await api.patch(`/users/${id}`, user);
    return response.data;
  },
};

export const submissionService = {
  getAll: async () => {
    const response = await api.get("/submissions");
    return response.data;
  },
  create: async (submission: any) => {
    const response = await api.post("/submissions", submission);
    return response.data;
  },
};

export const jobService = {
  getAll: async () => {
    const response = await api.get("/jobs");
    return response.data;
  },
  create: async (job: any) => {
    const response = await api.post("/jobs", job);
    return response.data;
  },
};

export const plantService = {
  getAll: async () => {
    const response = await api.get("/plants");
    return response.data;
  },
};

export default api;
