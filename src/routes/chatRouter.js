import express from "express";
import { authenticate } from "../middleware/authMiddleware.js";
import * as chatController from "../controllers/chatController.js";

const router = express.Router();

router.get("/history", authenticate, chatController.getChatHistory);
router.delete("/:id", authenticate, chatController.deleteMessage);
router.delete("/", authenticate, chatController.clearChat);

export default router;
