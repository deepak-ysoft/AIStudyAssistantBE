import express from "express";
import * as aiController from "../controllers/aiController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/chat", authenticate, aiController.chat);
router.post("/chat-stream", authenticate, aiController.chat);
router.post(
  "/:id/mcqs-from-notes",
  authenticate,
  aiController.generateQuizFromNote
);
router.post("/:id/flashcards", aiController.generateAndSaveFlashcards);
router.post("/:id/summarize", authenticate, aiController.generateSummary);
router.post("/study-plan", authenticate, aiController.generateStudyPlan);
router.post("/solve", authenticate, aiController.solveProblem);
router.post("/weekly-report", authenticate, aiController.generateWeeklyReport);

export default router;
