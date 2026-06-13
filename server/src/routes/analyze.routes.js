import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller.js';
import { validateSessionMiddleware } from '../middleware/validateSession.middleware.js';

const analyzeRouter = Router();

analyzeRouter.post('/analyze', validateSessionMiddleware, analyzeController);

export { analyzeRouter };
