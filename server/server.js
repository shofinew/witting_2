require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const authRoutes = require('./src/routes/auth.js');
const eventRoutes = require('./src/routes/event.js');
const { errorHandler } = require('./src/middleware/errorHandler');
const { apiRateLimiter } = require('./src/middleware/rateLimit');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Allow localhost origins for development
        if (origin.startsWith('http://localhost:')) return callback(null, true);

        // Allow the configured CLIENT_URL
        if (origin === CLIENT_URL) return callback(null, true);

        return callback(new Error('Not allowed by CORS'));
    },
    credentials: true
}));
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api', apiRateLimiter);
app.use('/api', authRoutes);
app.use('/api', eventRoutes);

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

