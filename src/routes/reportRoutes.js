import express from 'express';
import * as reportController from '../controllers/reportController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/weekly', authenticate, reportController.getWeeklyReport);
router.get('/monthly', authenticate, reportController.getMonthlyReport);
router.get('/performance', authenticate, reportController.getPerformanceStats);
router.get('/export', authenticate, reportController.exportReport);
router.get('/streak', authenticate, reportController.getStreakData);

export default router;
