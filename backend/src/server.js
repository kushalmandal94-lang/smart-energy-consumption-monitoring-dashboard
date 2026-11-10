const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const connectDB = require('./config/db');
const User = require('./models/User');
const userStore = require('./utils/userStore');
const { notFound, errorHandler } = require('./middleware/errorHandler');

// Hook to auto-sync offline registered users whenever MongoDB Atlas connects
mongoose.connection.on('connected', async () => {
  try {
    await userStore.syncToMongo(User);
  } catch (syncErr) {
    console.warn('Notice: Background user sync deferred:', syncErr.message);
  }
});

// Load environment variables from .env
dotenv.config();

const app = express();

// Middleware
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5174',
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV !== 'test') {
  app.use(morgan('dev'));
}

// General System Health Check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'Smart Energy Consumption Monitoring API',
    version: '1.0.0',
  });
});

// Requirement 10: GET /api/health/database to verify MongoDB Atlas connectivity
app.get('/api/health/database', async (req, res) => {
  try {
    const readyStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const state = mongoose.connection.readyState;
    const isConnected = state === 1;

    if (!isConnected) {
      return res.status(503).json({
        success: false,
        status: readyStateMap[state] || 'unknown',
        message: 'MongoDB Atlas is currently disconnected',
        readyState: state,
        timestamp: new Date().toISOString(),
      });
    }

    // Perform an active ping to MongoDB Atlas admin db
    const pingStart = Date.now();
    const adminDb = mongoose.connection.db.admin();
    const pingResult = await adminDb.ping();
    const latencyMs = Date.now() - pingStart;

    res.status(200).json({
      success: true,
      status: 'connected',
      message: 'MongoDB Connected Successfully!',
      database: mongoose.connection.name,
      host: mongoose.connection.host,
      readyState: state,
      ping: pingResult.ok === 1 ? 'ok' : 'failed',
      latency: `${latencyMs}ms`,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      status: 'error',
      message: 'Failed to communicate with MongoDB Atlas',
      error: error.message,
    });
  }
});

// Endpoint to test database write and read operations
app.get('/api/health/database/test-crud', async (req, res) => {
  try {
    const testCollection = mongoose.connection.db.collection('system_diagnostics');
    const testPayload = {
      testId: 'atlas-connectivity-check',
      message: 'MongoDB Atlas Read/Write Verification',
      timestamp: new Date(),
    };

    // 1. Insert test document
    const insertResult = await testCollection.insertOne(testPayload);

    // 2. Retrieve test document
    const retrievedDoc = await testCollection.findOne({ _id: insertResult.insertedId });

    // 3. Clean up test document
    await testCollection.deleteOne({ _id: insertResult.insertedId });

    res.status(200).json({
      success: true,
      message: 'Database insertion and retrieval test passed successfully!',
      operations: {
        insertedId: insertResult.insertedId,
        retrievedData: retrievedDoc,
        cleanedUp: true,
      },
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Database write/read test failed',
      error: error.message,
    });
  }
});

// Mount Application Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));
app.use('/api/buildings', require('./routes/buildingRoutes'));
app.use('/api/energy', require('./routes/energyRoutes'));
app.use('/api/meters', require('./routes/meterRoutes'));
app.use('/api/energy-sources', require('./routes/energySourceRoutes'));
app.use('/api/iot-simulation', require('./routes/simulationRoutes'));
app.use('/api/thresholds', require('./routes/thresholdRoutes'));
app.use('/api/devices', require('./routes/deviceRoutes'));
app.use('/api/smart-loads', require('./routes/smartLoadRoutes'));
app.use('/api/load-schedules', require('./routes/loadScheduleRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/forecasting', require('./routes/forecastingRoutes'));
app.use('/api/maintenance', require('./routes/maintenanceRoutes'));
app.use('/api/sustainability', require('./routes/sustainabilityRoutes'));
app.use('/api/reports', require('./routes/reportRoutes'));
app.use('/api/audit-logs', require('./routes/auditLogRoutes'));
app.use('/api/demand-response', require('./routes/demandResponseRoutes'));

// Error handling middleware
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

// Connect MongoDB before starting the Express server
const startServer = async () => {
  try {
    // Connect to MongoDB Atlas first
    await connectDB();
  } catch (err) {
    console.warn(`⚠️ Initial MongoDB Atlas connection attempt unsuccessful (${err.message}).`);
    console.warn(`👉 The server will start on port ${PORT} to allow access. Please verify IP whitelist in MongoDB Atlas.`);
  }

  // Start Express server after connection attempt
  const server = app.listen(PORT, () => {
    console.log(`
🚀 =======================================================
⚡ Smart Energy Backend running on port ${PORT}
🌍 Environment: ${process.env.NODE_ENV || 'development'}
📡 Health Check:     http://localhost:${PORT}/api/health
📡 Database Health:  http://localhost:${PORT}/api/health/database
=======================================================
    `);
  });

  // Background reconnect watcher if database was initially unreachable (e.g. IP whitelist updated)
  setInterval(async () => {
    if (mongoose.connection.readyState === 0) {
      try {
        await connectDB();
      } catch (retryErr) {
        // silent retry in background
      }
    }
  }, 15000);

  return server;
};

// Start server if run directly
if (require.main === module) {
  startServer();
}

module.exports = { app, startServer };
