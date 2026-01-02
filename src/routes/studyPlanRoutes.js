import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import {
  getStudyPlan,
  clearStudyPlan,
} from "../controllers/studyPlanController.js";

const router = express.Router();

router.get("/", authenticate, getStudyPlan);
router.delete("/", authenticate, clearStudyPlan);

export default router;
