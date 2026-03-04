import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import pino from 'pino';

// Load environment variables
dotenv.config();

const app = express();
const logger = pino({
  transport: {
    target: 'pino-pretty',
  },
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  });
});

// API routes (will be added)
// app.use('/api/v1', apiRoutes);

// Error handling
app.use((err, req, res, next) => {
  logger.error(err);
  res.status(500).json({
    success: false,
    error: {
      code: 'INTERNAL_ERROR',
      message: err.message,
    },
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
