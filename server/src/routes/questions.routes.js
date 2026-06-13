import { Router } from 'express';
import { getAllQuestions, getFirstQuestion } from '../controllers/questions.controller.js';

const questionsRouter = Router();

questionsRouter.get('/questions', getAllQuestions);
questionsRouter.get('/questions/first', getFirstQuestion);

export { questionsRouter };
