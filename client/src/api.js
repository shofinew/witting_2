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

    requestPasswordReset: async (email) => {
        const response = await fetch(`${API_URL}/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Password reset request failed');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    resetPassword: async (email, otp, password, passwordConfirm) => {
        const response = await fetch(`${API_URL}/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, otp, password, passwordConfirm }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Password reset failed');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    validateSession: async (userId, sessionVersion) => {
        const response = await fetch(`${API_URL}/session/validate`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId, sessionVersion }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Session validation failed');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    getAuditLogs: async (userId) => {
        const response = await fetch(`${API_URL}/audit-logs/${userId}`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load audit logs');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    getAll: async (viewerUserId) => {
        const params = new URLSearchParams();
        if (viewerUserId) {
            params.set('viewerUserId', viewerUserId);
        }

        const response = await fetch(`${API_URL}/users${params.toString() ? `?${params.toString()}` : ''}`);
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

    toggleFollow: async (followerUserId, followeeUserId) => {
        const response = await fetch(`${API_URL}/follow`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                followerUserId,
                followeeUserId,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update follow status');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};

export const userAPI = {
    getAll: async (viewerUserId) => {
        return authAPI.getAll(viewerUserId);
    },

    getById: async (userId, viewerUserId) => {
        const params = new URLSearchParams();
        if (viewerUserId) {
            params.set('viewerUserId', viewerUserId);
        }

        const response = await fetch(`${API_URL}/users/${userId}${params.toString() ? `?${params.toString()}` : ''}`);
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

export const publicEventAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/public-events`);
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load public events');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    create: async (creatorId, title, description, date, time) => {
        const response = await fetch(`${API_URL}/public-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creatorId,
                title,
                description,
                date,
                time,
            }),
        });
        const data = await response.json();

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to create public event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};
