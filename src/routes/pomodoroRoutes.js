import express from "express";
import * as pomodoroController from "../controllers/pomodoroController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/start", authenticate, pomodoroController.startSession);
router.post("/end", authenticate, pomodoroController.endSession);
router.get("/stats/today", authenticate, pomodoroController.getTodayStats);
router.get("/history", authenticate, pomodoroController.getHistory);

export default router;
