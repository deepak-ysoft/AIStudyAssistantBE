import express from "express";
import {
  createFlashcard,
  getAllFlashcards,
  getFlashcardById,
  updateFlashcard,
  deleteFlashcard,
  reviewFlashcard,
  getFlashcardsBySubject,
  generateAndSaveFlashcards,
} from "../controllers/FlashcardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(authenticate);

router.post("/", createFlashcard);
router.get("/", getAllFlashcards);
router.get("/:id", getFlashcardById);
router.put("/:id", updateFlashcard);
router.delete("/:id", deleteFlashcard);
router.post("/:id/flashcards", generateAndSaveFlashcards);
router.post("/:id/review", reviewFlashcard);
router.get("/subject/:subjectId", getFlashcardsBySubject);

export default router;
