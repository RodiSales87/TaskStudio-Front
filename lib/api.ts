import axios from 'axios';

export const api = axios.create({
    baseURL: 'http://localhost:3001',
});

api.interceptors.request.use((config) => {
    if (typeof window !== 'undefined') {
        const token = localStorage.getItem('@Revelatio:token');
        if (token) {
            // Voltando para crases reais (Template String)
            config.headers.Authorization = `Bearer ${token}`;
        }
    }
    return config;
});

export const authService = {

    async register(name: string, email: string, password: string) {
        const response = await api.post('/user', { name, email, password });
        return response.data;
    },

    async login(email: string, password: string) {
        const response = await api.post('/sessions', { email, password });

        const accessToken = response.data.data.accessToken;
        const loggedUser = response.data.data.loggedUser;

        if (typeof window !== 'undefined') {
            localStorage.setItem('@Revelatio:token', accessToken);
            localStorage.setItem('@Revelatio:user', JSON.stringify(loggedUser));
        }

        return { token: accessToken, user: loggedUser };
    },

    logout() {
        if (typeof window !== 'undefined') {
            localStorage.removeItem('@Revelatio:token');
            localStorage.removeItem('@Revelatio:user');
            window.location.href = '/';
        }
    }
};

export const taskService = {
    async getTasks() {
        const response = await api.get('/task');
        return response.data.data;
    },

    async createTask(taskData: { title: string; description?: string; status?: string; deadline?: string }) {
        const response = await api.post('/task', taskData);
        return response.data.data;
    },

    async updateTask(taskId: string, taskData: any) {
        const response = await api.patch(`/task/${taskId}`, taskData);
        return response.data.data;
    },

    async deleteTask(taskId: string) {
        const response = await api.delete(`/task/${taskId}`);
        return response.data;
    },

    async uploadAttachment(taskId: string, file: File) {
        const formData = new FormData();
        formData.append('file', file);
        const response = await api.post(`/file/task/${taskId}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            }
        });
        return response.data.data;
    },

    async removeAttachment(attachmentId: string) {
        const response = await api.delete(`/file/${attachmentId}`);
        return response.data;
    }
};
