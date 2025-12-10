import express from 'express';
import * as subjectController from '../controllers/subjectController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, subjectController.createSubject);
router.get('/', authenticate, subjectController.getAllSubjects);
router.get('/:id', authenticate, subjectController.getSubjectById);
router.put('/:id', authenticate, subjectController.updateSubject);
router.delete('/:id', authenticate, subjectController.deleteSubject);
router.post('/:id/resources', authenticate, subjectController.addResource);

export default router;
