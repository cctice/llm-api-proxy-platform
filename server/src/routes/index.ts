import { Router } from 'express';
import authRoutes from './auth';
import apiKeyRoutes from './apiKey';
import proxyRoutes from './proxy';

const router = Router();

// Health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    data: {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// API routes
router.use('/auth', authRoutes);
router.use('/api-keys', apiKeyRoutes);
router.use('/proxy', proxyRoutes);

export default router;
