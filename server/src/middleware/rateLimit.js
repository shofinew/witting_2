const parsePositiveInteger = (value, fallback) => {
    const parsed = Number.parseInt(value, 10);
    return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const createRateLimiter = ({
    windowMs = 15 * 60 * 1000,
    maxRequests = 100,
    message = 'Too many requests. Please try again later.',
} = {}) => {
    const requests = new Map();

    return (req, res, next) => {
        const now = Date.now();
        const key = req.ip || req.socket?.remoteAddress || 'unknown';
        const current = requests.get(key);

        if (!current || current.expiresAt <= now) {
            requests.set(key, {
                count: 1,
                expiresAt: now + windowMs,
            });
            return next();
        }

        if (current.count >= maxRequests) {
            const retryAfterSeconds = Math.max(1, Math.ceil((current.expiresAt - now) / 1000));
            res.set('Retry-After', String(retryAfterSeconds));
            return res.status(429).json({ message });
        }

        current.count += 1;
        requests.set(key, current);
        return next();
    };
};

const apiRateLimiter = createRateLimiter({
    windowMs: parsePositiveInteger(process.env.API_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: parsePositiveInteger(process.env.API_RATE_LIMIT_MAX_REQUESTS, 300),
    message: process.env.API_RATE_LIMIT_MESSAGE || 'Too many API requests. Please try again later.',
});

const authRateLimiter = createRateLimiter({
    windowMs: parsePositiveInteger(process.env.AUTH_RATE_LIMIT_WINDOW_MS, 15 * 60 * 1000),
    maxRequests: parsePositiveInteger(process.env.AUTH_RATE_LIMIT_MAX_REQUESTS, 20),
    message: process.env.AUTH_RATE_LIMIT_MESSAGE || 'Too many authentication attempts. Please try again later.',
});

module.exports = {
    createRateLimiter,
    apiRateLimiter,
    authRateLimiter,
};
