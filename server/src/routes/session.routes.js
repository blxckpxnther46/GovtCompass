import { Router } from 'express';
import { createSessionController, answerController, meController } from '../controllers/session.controller.js';
import { validateSessionMiddleware } from '../middleware/validateSession.middleware.js';

const sessionRouter = Router();

sessionRouter.post('/session/create', createSessionController);
sessionRouter.post('/session/answer', validateSessionMiddleware, answerController);
sessionRouter.get('/session/me', validateSessionMiddleware, meController);

export { sessionRouter };
