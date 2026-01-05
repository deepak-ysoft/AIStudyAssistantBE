import express from "express";
import * as authController from "../controllers/authController.js";
import { authenticate } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/send-otp", authController.sendRestoreOtp);
router.post("/verify", authController.verifyRestoreOtp);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.put("/change-password", authenticate, authController.changePassword);
router.put("/change-email", authenticate, authController.changeEmail);
router.post("/verify-email", authController.verifyEmail);
router.post("/resend-verification", authController.resendVerificationEmail);
router.get("/profile", authenticate, authController.getProfile);
router.put("/profile", authenticate, authController.updateProfile);
router.delete("/delete-account", authenticate, authController.deleteAccount);
router.get("/imagekit-auth", authenticate, authController.getImageKitAuth);

export default router;
