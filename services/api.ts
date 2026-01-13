
import axios from 'axios';

const api = axios.create({
    baseURL: '/api', // Proxy will handle this
    headers: {
        'Content-Type': 'application/json',
    },
});

export const projectService = {
    getAll: async () => {
        const response = await api.get('/projects');
        return response.data;
    },
    create: async (project: any) => {
        const response = await api.post('/projects', project);
        return response.data;
    },
    update: async (id: string, project: any) => {
        const response = await api.put(`/projects/${id}`, project);
        return response.data;
    }
};

export const userService = {
    getAll: async () => {
        const response = await api.get('/users');
        return response.data;
    },
    update: async (id: string, user: any) => {
        const response = await api.patch(`/users/${id}`, user);
        return response.data;
    }
};

export const submissionService = {
    getAll: async () => {
        const response = await api.get('/submissions');
        return response.data;
    },
    create: async (submission: any) => {
        const response = await api.post('/submissions', submission);
        return response.data;
    }
};

export const jobService = {
    getAll: async () => {
        const response = await api.get('/jobs');
        return response.data;
    },
    create: async (job: any) => {
        const response = await api.post('/jobs', job);
        return response.data;
    }
};

export const plantService = {
    getAll: async () => {
        const response = await api.get('/plants');
        return response.data;
    }
};

export default api;
