const User = require('../models/User');

const requireAuth = async (req, res, next) => {
    const userId = req.get('x-user-id');
    const sessionVersion = req.get('x-session-version');

    if (!userId) {
        return res.status(401).json({ message: 'Authentication required.' });
    }

    try {
        const user = await User.findById(userId).select('_id role sessionVersion isPaused');

        if (!user || Number(user.sessionVersion || 0) !== Number(sessionVersion || 0)) {
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
        return res.status(401).json({ message: 'Invalid authentication session.' });
    }
};

module.exports = { requireAuth };
