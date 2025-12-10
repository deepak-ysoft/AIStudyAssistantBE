import express from 'express';
import * as notesController from '../controllers/notesController.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', authenticate, notesController.createNote);
router.get('/', authenticate, notesController.getAllNotes);
router.get('/:id', authenticate, notesController.getNoteById);
router.put('/:id', authenticate, notesController.updateNote);
router.delete('/:id', authenticate, notesController.deleteNote);
router.post('/:id/summarize', authenticate, notesController.generateSummary);
router.post('/upload', authenticate, notesController.uploadFile);

export default router;
