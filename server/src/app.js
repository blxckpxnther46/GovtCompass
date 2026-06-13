import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import helmet from 'helmet';
import connectDB from './config/db.js';
import rateLimit from 'express-rate-limit';

import { healthRouter } from './routes/health.routes.js';
import schemeRouter from "./routes/scheme.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import metaRouter from "./routes/meta.routes.js";
import { questionsRouter } from './routes/questions.routes.js';
import { sessionRouter } from './routes/session.routes.js';
import { analyzeRouter } from './routes/analyze.routes.js';

import aiIntakeRouter from "./routes/ai.intake.routes.js";
import aiExplainRouter from "./routes/ai.explain.routes.js";
import aiEligibilityRouter from "./routes/ai.eligibility.routes.js";
import aiRefineRouter from "./routes/ai.refine.routes.js";

import { notFoundMiddleware } from './middleware/notFound.middleware.js';
import { errorMiddleware } from './middleware/error.middleware.js';
import { requireApiKey } from './middleware/apiKey.middleware.js';

dotenv.config();

const app = express();
app.use(helmet());

app.use(express.json());
connectDB()


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

// Secure all API routes below this line with an API Key
app.use('/api', requireApiKey);

app.use("/api/schemes", schemeRouter);
app.use("/api/recommendations", recommendationRouter);
app.use("/api/meta", metaRouter);
app.use('/api', questionsRouter);
app.use('/api', sessionRouter);
app.use('/api', analyzeRouter);

// Rate limiter specifically for AI routes to protect OpenRouter credits
const aiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute window
  max: 20, // limit each IP to 20 requests per windowMs
  message: { success: false, message: 'Too many AI requests from this IP, please try again after a minute' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api/ai", aiLimiter, aiIntakeRouter);
app.use("/api/ai", aiLimiter, aiExplainRouter);
app.use("/api/ai", aiLimiter, aiEligibilityRouter);
app.use("/api/ai", aiLimiter, aiRefineRouter);

// Not found + global error handler
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export { app };

