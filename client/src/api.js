import { API_URL } from './constants';

const ACCESS_TOKEN_KEY = 'wittingAccessToken';

export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token) => {
    if (token) localStorage.setItem(ACCESS_TOKEN_KEY, token);
};
export const clearAccessToken = () => localStorage.removeItem(ACCESS_TOKEN_KEY);

// Keep authentication centralized so every API request carries the current token.
const fetch = (input, init = {}) => {
    const headers = new Headers(init.headers || {});
    const token = getAccessToken();
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return window.fetch(input, { ...init, headers });
};

// Safe JSON parser with proper error handling
const safeJsonParse = async (response, fallbackMessage) => {
    if (response.status === 401) {
        clearAccessToken();
        window.dispatchEvent(new CustomEvent('witting:auth-expired'));
    }

    const contentType = response.headers.get('content-type');

    if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();

        if (response.status === 429) {
            return { message: 'Too many requests. Please try again later.' };
        }

        if (text) {
            return { message: text || fallbackMessage };
        }

        return { message: fallbackMessage };
    }

    try {
        const data = await response.json();
        if (response.status === 403 && String(data.message || '').toLowerCase().includes('paused')) {
            window.dispatchEvent(new CustomEvent('witting:account-paused', {
                detail: data.message,
            }));
        }
        return data;
    } catch (err) {
        if (response.status === 429) {
            return { message: 'Too many requests. Please try again later.' };
        }

        return { message: fallbackMessage };
    }
};

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
        const data = await safeJsonParse(response, 'Registration failed');

        if (!response.ok) {
            const error = new Error(
                response.status === 429
                    ? 'Too many authentication attempts. Please try again later.'
                    : data.message || 'Registration failed'
            );
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
        const data = await safeJsonParse(response, 'Login failed');

        if (!response.ok) {
            const error = new Error(
                response.status === 429
                    ? 'Too many authentication attempts. Please try again later.'
                    : data.message || 'Login failed'
            );
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
        const data = await safeJsonParse(response, 'Password reset request failed');

        if (!response.ok) {
            const error = new Error(
                response.status === 429
                    ? 'Too many authentication attempts. Please try again later.'
                    : data.message || 'Password reset request failed'
            );
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
        const data = await safeJsonParse(response, 'Password reset failed');

        if (!response.ok) {
            const error = new Error(
                response.status === 429
                    ? 'Too many authentication attempts. Please try again later.'
                    : data.message || 'Password reset failed'
            );
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
        const data = await safeJsonParse(response, 'Session validation failed');

        if (!response.ok) {
            const error = new Error(
                response.status === 429
                    ? 'Too many authentication attempts. Please try again later.'
                    : data.message || 'Session validation failed'
            );
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    getAuditLogs: async (userId) => {
        const response = await fetch(`${API_URL}/audit-logs/${userId}`);
        const data = await safeJsonParse(response, 'Failed to load audit logs');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load audit logs');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    getBlockedUsers: async (userId) => {
        const response = await fetch(`${API_URL}/blocked-users/${userId}`);
        const data = await safeJsonParse(response, 'Failed to load blocked users');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load blocked users');
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
        const data = await safeJsonParse(response, 'Failed to load users');

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
        const data = await safeJsonParse(response, 'Profile update failed');

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
        const data = await safeJsonParse(response, 'Failed to update follow status');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update follow status');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    toggleBlock: async (blockerUserId, blockedUserId) => {
        const response = await fetch(`${API_URL}/block`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                blockerUserId,
                blockedUserId,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to update block status');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update block status');
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
        const data = await safeJsonParse(response, 'Failed to load user');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load user');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    setPaused: async (userId, paused) => {
        const response = await fetch(`${API_URL}/users/${userId}/pause`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ paused }),
        });
        const data = await safeJsonParse(response, 'Failed to update account status');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update account status');
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
        const data = await safeJsonParse(response, 'Failed to load events');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load events');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    create: async (creator, target, description, message, date, timeDuration) => {
        const response = await fetch(`${API_URL}/event/add`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creator,
                target,
                description,
                message,
                date,
                timeDuration,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to create event');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to create event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    update: async (eventId, description, message, actorUserId, date, timeDuration) => {
        const response = await fetch(`${API_URL}/event/${eventId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description,
                message,
                actorUserId,
                date,
                timeDuration,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to update event');

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
        const data = await safeJsonParse(response, 'Failed to delete event');

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
        const data = await safeJsonParse(response, 'Failed to advance event');

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
        const data = await safeJsonParse(response, 'Failed to publish event');

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
        const data = await safeJsonParse(response, 'Failed to archive event');

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
        const data = await safeJsonParse(response, 'Failed to start event timer');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to start event timer');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};

export const notificationAPI = {
    getAll: async () => {
        const response = await fetch(`${API_URL}/notifications`);
        const data = await safeJsonParse(response, 'Failed to load notifications');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load notifications');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    markRead: async (notificationId) => {
        const response = await fetch(`${API_URL}/notifications/${notificationId}/read`, {
            method: 'PATCH',
        });
        const data = await safeJsonParse(response, 'Failed to update notification');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update notification');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    markAllRead: async () => {
        const response = await fetch(`${API_URL}/notifications/read-all`, {
            method: 'PATCH',
        });
        const data = await safeJsonParse(response, 'Failed to update notifications');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to update notifications');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};

export const publicEventAPI = {
    getAll: async (creatorId, viewerUserId) => {
        const params = new URLSearchParams();
        if (creatorId) params.set('creatorId', creatorId);
        if (viewerUserId) params.set('viewerUserId', viewerUserId);

        const response = await fetch(`${API_URL}/public-events${params.toString() ? `?${params.toString()}` : ''}`);
        const data = await safeJsonParse(response, 'Failed to load public events');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to load public events');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    create: async (creatorId, title, description, location, startDate, startTime, endDate, endTime) => {
        const response = await fetch(`${API_URL}/public-events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                creatorId,
                title,
                description,
                location,
                startDate,
                startTime,
                endDate,
                endTime,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to create public event');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to create public event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    like: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/public-events/${eventId}/like`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to like public event');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to like public event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },

    remove: async (eventId, actorUserId) => {
        const response = await fetch(`${API_URL}/public-events/${eventId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                actorUserId,
            }),
        });
        const data = await safeJsonParse(response, 'Failed to delete public event');

        if (!response.ok) {
            const error = new Error(data.message || 'Failed to delete public event');
            error.statusCode = response.status;
            throw error;
        }

        return data;
    },
};
