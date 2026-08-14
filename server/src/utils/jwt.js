const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

if (!JWT_SECRET && process.env.NODE_ENV === 'production') {
    throw new Error('JWT_SECRET must be configured in production.');
}

const getSecret = () => JWT_SECRET || 'development-only-change-me';

const signAccessToken = (user) => jwt.sign(
    {
        sub: String(user._id),
        role: user.role || 'user',
        sessionVersion: Number(user.sessionVersion || 0),
    },
    getSecret(),
    {
        expiresIn: JWT_EXPIRES_IN,
        issuer: process.env.JWT_ISSUER || 'witting-api',
        audience: process.env.JWT_AUDIENCE || 'witting-client',
    }
);

const verifyAccessToken = (token) => jwt.verify(token, getSecret(), {
    issuer: process.env.JWT_ISSUER || 'witting-api',
    audience: process.env.JWT_AUDIENCE || 'witting-client',
});

module.exports = { signAccessToken, verifyAccessToken };
