import { sendSuccess, sendError } from "../utils/response.js";
import * as authService from "../services/authService.js";
import imagekit from "../utils/imagekit.js";

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
    if (!email) {
      return sendError(res, 400, "Please provide email");
    }
    return sendSuccess(res, 200, "Password reset link sent to email");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    if (!token || !newPassword) {
      return sendError(res, 400, "Please provide token and new password");
    }
    return sendSuccess(res, 200, "Password reset successfully");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
