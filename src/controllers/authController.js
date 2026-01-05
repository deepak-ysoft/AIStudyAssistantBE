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
      return sendError(res, 200, "Please provide all required fields");
    }

    const result = await authService.signup(name, email, password);

    return sendSuccess(res, 201, result);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const result = await authService.login(email, password);
    return sendSuccess(res, 200, "Login successful", result);
  } catch (error) {
    if (error.code === "ACCOUNT_DELETED") {
      return sendError(res, 403, "ACCOUNT_DELETED");
    }

    if (error.code === "EMAIL_NOT_VERIFIED") {
      return sendError(res, 403, "EMAIL_NOT_VERIFIED");
    }

    return sendError(res, 401, "Invalid email or password");
  }
};

const hashOtp = (otp) => crypto.createHash("sha256").update(otp).digest("hex");

export const sendRestoreOtp = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();

    if (!email) return sendError(res, 400, "Email is required");

    const user = await UserModel.findOne({ email, isDeleted: true });
    if (!user) {
      // SECURITY: don’t reveal account status
      return sendSuccess(res, 200, "OTP sent if account exists");
    }

    // Generate OTP
    const otp = authService.generateOtp(); // 6-digit

    user.restoreOtp = hashOtp(otp);
    user.restoreOtpExpiry = Date.now() + 10 * 60 * 1000; // 10 minutes

    await user.save({ validateBeforeSave: false });

    // Send email
    await sendEmail({
      to: user.email,
      subject: "Restore Your Account – OTP Verification",
      html: `
        <p>Hello ${user.name},</p>

        <p>
          We received a request to restore your account.
          Please use the verification code below to continue:
        </p>

        <h2 style="letter-spacing: 4px; font-size: 28px;">
          ${otp}
        </h2>

        <p>
          This OTP is valid for <strong>10 minutes</strong>.
        </p>

        <p>
          If you did not request this, you can safely ignore this email.
        </p>

        <p>
          Thanks,<br />
          ${process.env.APP_NAME || "Support Team"}
        </p>
      `,
    });

    return sendSuccess(res, 200, "OTP sent successfully");
  } catch (error) {
    return sendError(res, 200, "Failed to send OTP");
  }
};

export const verifyRestoreOtp = async (req, res) => {
  try {
    let { email, otp } = req.body;
    email = email.toLowerCase();

    if (!email || !otp) {
      return sendError(res, 200, "Email and OTP are required");
    }

    const hashedOtp = hashOtp(otp);

    const user = await UserModel.findOne({
      email,
      restoreOtp: hashedOtp,
      restoreOtpExpiry: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 200, "Invalid or expired OTP");
    }

    user.isDeleted = false;
    user.restoreOtp = undefined;
    user.restoreOtpExpiry = undefined;
    user.deletedAt = null;

    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, "Account restored successfully");
  } catch (error) {
    return sendError(res, 200, "Failed to verify OTP");
  }
};

export const getProfile = async (req, res) => {
  try {
    const user = await authService.getProfile(req.userId);
    return sendSuccess(res, 200, "Profile fetched successfully", user);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const updateProfile = async (req, res) => {
  try {
    const user = await authService.updateProfile(req.userId, req.body);
    return sendSuccess(res, 200, "Profile updated successfully", user);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const getImageKitAuth = (req, res) => {
  const authParams = imagekit.getAuthenticationParameters();
  res.json(authParams);
};

export const forgotPassword = async (req, res) => {
  try {
    let { email } = req.body;
    email = email.toLowerCase();

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
    return sendError(res, 200, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 200, "Token and new password required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    });

    if (!user) {
      return sendError(res, 200, "Invalid or expired token");
    }

    user.password = newPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save();

    return sendSuccess(res, 200, "Password reset successfully");
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return sendError(
        res,
        200,
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
      return sendError(res, 200, "Current password is incorrect");
    }

    // Prevent same password reuse
    const isSame = await user.matchPassword(newPassword);
    if (isSame) {
      return sendError(
        res,
        200,
        "New password must be different from current password"
      );
    }

    // Set new password (hashing handled by pre-save hook)
    user.password = newPassword;
    await user.save();

    return sendSuccess(res, 200, "Password changed successfully");
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const verifyEmail = async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return sendError(res, 200, "Verification token required");
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await UserModel.findOne({
      verificationToken: hashedToken,
    });

    if (!user) {
      return sendError(res, 200, "Invalid or expired verification token");
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;

    if (user.pendingEmail) {
      user.email = user.pendingEmail;
      user.pendingEmail = null;
    }

    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, "Email verified successfully");
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const resendVerificationEmail = async (req, res) => {
  try {
    let { email } = req.body; // ✅ use let
    if (!email) {
      return sendError(res, 400, "Email required");
    }

    email = email.toLowerCase();

    const user = await UserModel.findOne({ email });

    // 🔒 SECURITY: don't reveal if user exists
    if (!user) {
      return sendSuccess(
        res,
        200,
        "If the email exists, a verification email has been sent"
      );
    }

    if (user.isEmailVerified) {
      return sendError(res, 400, "Email already verified");
    }

    // 🔐 Generate new token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    user.verificationToken = hashedToken;
    user.resetPasswordExpire = Date.now() + 24 * 60 * 60 * 1000; // ⏳ 24h
    await user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL}/auth/verify-email/${rawToken}`;

    await sendEmail({
      to: user.email,
      subject: "Verify Your Email",
      html: `
        <p>Hello ${user.name},</p>
        <p>Please verify your email by clicking the link below:</p>
        <a href="${verifyUrl}">Verify Email</a>
        <p>This link will expire in 24 hours.</p>
      `,
    });

    return sendSuccess(res, 200, "Verification email sent");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const changeEmail = async (req, res) => {
  try {
    let { newEmail } = req.body;
    newEmail = newEmail.toLowerCase();

    if (!newEmail) {
      return sendError(res, 200, "New email is required");
    }

    const existing = await UserModel.findOne({ email: newEmail });
    if (existing) {
      return sendError(res, 200, "Email already in use");
    }

    const user = await UserModel.findById(req.userId);

    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto
      .createHash("sha256")
      .update(rawToken)
      .digest("hex");

    const verifyUrl = `${
      process.env.FRONTEND_URL
    }/auth/verify-email/${rawToken}?email=${encodeURIComponent(newEmail)}`;

    await sendEmail({
      to: newEmail,
      subject: "Confirm Your New Email",
      html: `
        <p>Click below to confirm your new email address:</p>
        <a href="${verifyUrl}">Confirm Email</a>
      `,
    });

    user.pendingEmail = newEmail;
    user.verificationToken = hashedToken;

    await user.save({ validateBeforeSave: false });

    return sendSuccess(res, 200, "Verification sent to new email");
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const deleteAccount = async (req, res) => {
  try {
    const { password } = req.body;

    if (!password) {
      return sendError(res, 200, "Password is required to delete the account");
    }

    const user = await UserModel.findById(req.userId).select("+password");

    if (!user || user.isDeleted) {
      return sendError(res, 404, "User account not found");
    }

    const isPasswordValid = await user.matchPassword(password);
    if (!isPasswordValid) {
      return sendError(res, 401, "Incorrect password");
    }

    user.isDeleted = true;
    user.deletedAt = new Date();

    await user.save();

    return sendSuccess(res, 200, "Your account has been deleted successfully");
  } catch (error) {
    console.error("Delete account error:", error);
    return sendError(
      res,
      200,
      "Something went wrong while deleting the account"
    );
  }
};
