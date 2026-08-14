const User = require('../models/User');
const { verifyAccessToken } = require('../utils/jwt');

const requireAuth = async (req, res, next) => {
    const header = req.get('authorization') || '';
    const [scheme, token] = header.split(' ');

    if (scheme !== 'Bearer' || !token) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const payload = verifyAccessToken(token);
        const user = await User.findById(payload.sub).select('_id role sessionVersion isPaused');

        if (!user || Number(user.sessionVersion || 0) !== Number(payload.sessionVersion || 0)) {
            return res.status(401).json({ message: 'Your session has expired. Please log in again.' });
        }

        if (user.isPaused) {
            return res.status(403).json({ message: 'This account is paused. Actions are currently disabled.' });
        }

        req.auth = {
            userId: String(user._id),
            role: user.role || 'user',
            sessionVersion: Number(user.sessionVersion || 0),
        };
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid or expired authentication token.' });
    }
};

module.exports = { requireAuth };
