require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const authRoutes = require('./src/routes/auth.js');
const eventRoutes = require('./src/routes/event.js');
const notificationRoutes = require('./src/routes/notification.js');
const { errorHandler } = require('./src/middleware/errorHandler');
const { apiRateLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Use the real client IP only when the deployment explicitly has a trusted
// reverse proxy. This avoids one proxy address becoming every user's bucket.
const trustProxy = process.env.TRUST_PROXY === 'true'
    ? 1
    : (process.env.TRUST_PROXY === 'false' ? false : process.env.NODE_ENV === 'production' ? 1 : false);
app.set('trust proxy', trustProxy);

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost origins for development
        if (origin.startsWith('http://localhost:')) return callback(null, true);

        // Allow the configured CLIENT_URL and vercel deployments
        if (origin === CLIENT_URL) return callback(null, true);
        if (origin && origin.includes('vercel.app')) return callback(null, true);

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());
app.disable('x-powered-by');

// Health Check Route
app.get('/', (req, res) => {
    res.json({ 
        message: 'Server is running!',
        clientUrl: CLIENT_URL,
        timestamp: new Date().toISOString()
    });
});

// CORS Debug Route
app.get('/api/debug', (req, res) => {
    res.json({
        message: 'CORS is working!',
        origin: req.headers.origin,
        clientUrl: CLIENT_URL,
        allowedDomains: [CLIENT_URL, 'vercel.app', 'localhost']
    });
});

// API Routes
app.use('/api', apiRateLimiter);
app.use('/api', authRoutes);
app.use('/api', eventRoutes);
app.use('/api', notificationRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server after database connection
connectDB()
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.error('Failed to start server:', error);
        process.exit(1);
    });

