require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { initSchema } = require('./scripts/initDb');
const authRoutes = require('./routes/auth.routes');
const eventRoutes = require('./routes/event.routes');
const registrationRoutes = require('./routes/registration.routes');
const { errorHandler } = require('./middlewares/errorHandler');

const app = express();

// Initialize DB tables automatically on boot
initSchema();

// Global Middlewares
app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());

// API Base Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'EventFlow Backend API'
  });
});

app.get('/', (req, res) => {
  res.status(200).json({
    message: 'Welcome to EventFlow API',
    documentation: '/api/v1/events',
    version: '1.0.0'
  });
});

// Mount Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1', registrationRoutes);

// Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 EventFlow Backend server running on http://localhost:${PORT}`);
  });
}

module.exports = app;
