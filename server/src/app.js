import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db.js';

import { healthRouter } from './routes/health.routes.js';
import schemeRouter from "./routes/scheme.routes.js";
import recommendationRouter from "./routes/recommendation.routes.js";
import metaRouter from "./routes/meta.routes.js";

dotenv.config();

const app = express();

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
app.use("/api/schemes", schemeRouter);
app.use(
  "/api/recommendations",
  recommendationRouter
);
app.use("/api/meta", metaRouter);

// Basic 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
  });
});

export { app };

