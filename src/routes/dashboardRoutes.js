import express from "express";
import { downloadReport, getDashboardData } from "../controllers/dashboardController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", authenticate, getDashboardData);
router.get("/report", authenticate, downloadReport);

export default router;
