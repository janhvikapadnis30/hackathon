require('dotenv').config();
const express = require('express');
const cors = require('cors');

// Import route modules
const authRoutes = require('./routes/authRoutes');
const studentRoutes = require('./routes/studentRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const feeRoutes = require('./routes/feeRoutes');
const examRoutes = require('./routes/examRoutes');
const resultRoutes = require('./routes/resultRoutes');
const reportRoutes = require('./routes/reportRoutes');
const academicRoutes = require('./routes/academicRoutes');

// Import error middlewares
const { errorHandler, notFoundHandler } = require('./middleware/errorMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================================================
// CORS Configuration
// Allows React development servers (Vite on 5173, CRA on 3000, etc.)
// ============================================================================
const allowedOrigins = (process.env.CORS_ORIGIN || 'http://localhost:3000,http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim());

const corsOptions = {
  origin: (origin, callback) => {
    // Allow server-to-server or tools without browser origin header
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) !== -1 || origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:')) {
      callback(null, true);
    } else {
      callback(new Error(`CORS policy blocks access from origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logger for local development
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ============================================================================
// Health Check Endpoint
// ============================================================================
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'ERP backend is running',
  });
});

// ============================================================================
// API Routes
// ============================================================================
app.use('/api/auth', authRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/fees', feeRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/results', resultRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/academic', academicRoutes);
app.use('/api', academicRoutes);

// ============================================================================
// Error & 404 Handlers
// ============================================================================
app.use(notFoundHandler);
app.use(errorHandler);

// Start listening if run directly
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`====================================================`);
    console.log(`🚀 College ERP Backend Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
    console.log(`====================================================`);
  });
}

module.exports = app;
