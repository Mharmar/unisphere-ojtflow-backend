import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { env } from './config/env';
import { errorMiddleware } from './middleware/error.middleware';
import { notFoundMiddleware } from './middleware/not-found.middleware';
import { sendSuccess } from './utils/api-response';

export function createApp() {
  const app = express();

  app.use(helmet());
  app.use(
    cors({
      origin: env.CORS_ORIGIN,
      credentials: true,
    })
  );
  app.use(express.json({ limit: '1mb' }));
  app.use(cookieParser());

  app.get('/api/v1/health', (_req, res) => {
    return sendSuccess(res, {
      status: 'ok',
      environment: env.NODE_ENV,
      timestamp: new Date().toISOString(),
    });
  });

  app.use(notFoundMiddleware);
  app.use(errorMiddleware);

  return app;
}