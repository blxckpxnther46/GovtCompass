import { Router } from 'express';
import { analyzeController } from '../controllers/analyze.controller.js';

const analyzeRouter = Router();

// No session middleware — answers are sent in the request body directly
analyzeRouter.post('/analyze', analyzeController);

export { analyzeRouter };
