require('dotenv').config();

const express = require('express');
const cors = require('cors');
const connectDB = require('./src/config/db.js');
const authRoutes = require('./src/routes/auth.js');
const eventRoutes = require('./src/routes/event.js');
const { errorHandler } = require('./src/middleware/errorHandler');

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Connect to Database
connectDB();

// Middleware
app.use(cors({ origin: CLIENT_URL }));
app.use(express.json());

// Health Check Route
app.get('/', (req, res) => {
    res.json({ message: 'Server is running!' });
});

// API Routes
app.use('/api', authRoutes);
app.use('/api', eventRoutes);

// Error Handler Middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
