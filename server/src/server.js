require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const interviewRoutes = require('./routes/interviewRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to Database (with automatic fallback to JSON store)
connectDB();

// Middlewares
app.use(cors({
  origin: '*', // Allow client connections
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-gemini-key']
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    aiProvider: process.env.GEMINI_API_KEY ? 'Google Gemini API' : 'Simulated Smart AI Engine (Fallback Mode)'
  });
});

// API Routes
app.use('/api/interviews', interviewRoutes);

// Global 404 Handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Endpoint not found' });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled server error:', err);
  res.status(500).json({
    success: false,
    error: 'Internal Server Error',
    message: err.message
  });
});

app.listen(PORT, () => {
  console.log(`=========================================`);
  console.log(`🚀 AI Mock Interview Server running on port ${PORT}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  console.log(`=========================================`);
});
