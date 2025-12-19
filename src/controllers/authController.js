import crypto from "crypto";
import { sendSuccess, sendError } from "../utils/response.js";
import * as authService from "../services/authService.js";
import imagekit from "../utils/imagekit.js";
import UserModel from "../models/UserModel.js";
import sendEmail from "../utils/sendEmail.js";
import { generateResetToken } from "../utils/resetToken.js";

export const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return sendError(res, 400, "Please provide all required fields");
    }

    const result = await authService.signup(name, email, password);
    return sendSuccess(res, 201, "User registered successfully", result);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 400, "Please provide email and password");
    }

    const result = await authService.login(email, password);
    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    return sendError(res, 401, error.message);
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.userId);
    return sendSuccess(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.userId, req.body);
    return sendSuccess(res, 200, "Profile updated successfully", user);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getImageKitAuth = (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams);
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return sendError(res, 400, "Email is required");

    const user = await UserModel.findOne({ email });
    if (!user) {
      // SECURITY: don’t reveal email existence
      return sendSuccess(res, 200, "Reset link sent if email exists");
    }

    const { rawToken, hashedToken } = generateResetToken();

    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpire =
      Date.now() + Number(process.env.RESET_TOKEN_EXPIRE_MINUTES) * 60 * 1000;

    await user.save({ validateBeforeSave: false });

    const resetUrl = `${process.env.FRONTEND_URL}/auth/reset-password/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Reset Your Password",
      html: `
        <p>Hello ${user.name},</p>
        <p>You requested a password reset.</p>
        <p>
          <a href="${resetUrl}" target="_blank">
            Click here to reset your password
          </a>
        </p>
        <p>This link expires in ${process.env.RESET_TOKEN_EXPIRE_MINUTES} minutes.</p>
        <p>If you didn’t request this, please ignore this email.</p>
      `,
    });

    return sendSuccess(res, 200, "Password reset link sent");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 400, "Token and new password required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 400, "Invalid or expired token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return sendSuccess(res, 200, "Password reset successfully");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(
        res,
        400,
        "Current password and new password are required"
      );
    }

    // Fetch user with password
    const user = await UserModel.findById(req.userId).select("+password");

    if (!user) {
      return sendError(res, 404, "User not found");
    }

    // Validate current password
    const isMatch = await user.matchPassword(currentPassword);
    if (!isMatch) {
      return sendError(res, 400, "Current password is incorrect");
    }

    // Prevent same password reuse
    const isSame = await user.matchPassword(newPassword);
    if (isSame) {
      return sendError(
        res,
        400,
        "New password must be different from current password"
      );
    }

    // Set new password (hashing handled by pre-save hook)
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
