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

// Routes
import routes from './routes';
import { requestLogger } from './middleware/logger';
import { errorHandler, notFound } from './middleware/errorHandler';

app.use(requestLogger);
app.use('/api/v1', routes);

// Error handling
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`LLM API Proxy Server running on http://localhost:${PORT}`);
  logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

export default app;
