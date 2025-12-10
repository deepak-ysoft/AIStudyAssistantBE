import express from 'express';
import * as quizController from '../controllers/quizController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, quizController.createQuiz);
router.get('/', authenticate, quizController.getAllQuizzes);
router.get('/:id', authenticate, quizController.getQuizById);
router.put('/:id', authenticate, quizController.updateQuiz);
router.delete('/:id', authenticate, quizController.deleteQuiz);
router.post('/:id/start', authenticate, quizController.startQuiz);
router.post('/:id/submit', authenticate, quizController.submitAnswer);
router.get('/:id/results', authenticate, quizController.getResults);

export default router;
