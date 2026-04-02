import { API_URL } from './constants';

// Improved API with proper error handling
export const authAPI = {
    register: async (name, email, password, passwordConfirm) => {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                name,
                email,
                password,
                passwordConfirm,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Registration failed');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    login: async (email, password) => {
        const response = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Login failed');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    getAll: async () => {
        const response = await fetch(`${API_URL}/users`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load users');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};

export const userAPI = {
    getAll: async () => {
        return authAPI.getAll();
    },
};

export const eventAPI = {
    getByStatus: async (status) => {
        const response = await fetch(`${API_URL}/events?status=${status}`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load events');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    create: async (creatorId, targetId, description, date, timeDuration) => {
        const response = await fetch(`${API_URL}/event/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creatorId,
                targetId,
                description,
                date,
                timeDuration,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to create event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    advance: async (eventId) => {
        const response = await fetch(`${API_URL}/event/${eventId}/advance`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to advance event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    publish: async (eventId) => {
        const response = await fetch(`${API_URL}/event/${eventId}/publish`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to publish event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};
