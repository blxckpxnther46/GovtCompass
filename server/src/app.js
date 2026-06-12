import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { healthRouter } from './routes/health.routes.js';
import { questionsRouter } from './routes/questions.routes.js';
import { sessionRouter } from './routes/session.routes.js';
import { analyzeRouter } from './routes/analyze.routes.js';

import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';

dotenv.config();

const app = express();

app.use(express.json());

const corsOrigin = process.env.CORS_ORIGIN || 'http://localhost:5173';
app.use(
  cors({
    origin: corsOrigin,
    credentials: true,
  })
);

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'GovtCompass API is running',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api', healthRouter);
app.use('/api', questionsRouter);
app.use('/api', sessionRouter);
app.use('/api', analyzeRouter);

// Not found + global error handler
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };

