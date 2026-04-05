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

    updateProfile: async (userId, updates) => {
        const response = await fetch(`${API_URL}/profile/${userId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updates),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Profile update failed');
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

    getById: async (userId) => {
        const response = await fetch(`${API_URL}/users/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load user');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};

export const eventAPI = {
    getByStatus: async (status, userId) => {
        const params = new URLSearchParams({ status });
        if (userId) {
            params.set('userId', userId);
        }

        const response = await fetch(`${API_URL}/events?${params.toString()}`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load events');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    create: async (creator, target, description, date, timeDuration) => {
        const response = await fetch(`${API_URL}/event/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator,
                target,
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

    update: async (eventId, description, date, timeDuration) => {
        const response = await fetch(`${API_URL}/event/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description,
                date,
                timeDuration,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    remove: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/event/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to delete event');
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

    publish: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/event/${eventId}/publish`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to publish event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    archive: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/event/${eventId}/archive`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to archive event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    start: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/event/${eventId}/start`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to start event timer');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};
