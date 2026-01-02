import { sendError } from "../utils/response.js";
import { verifyToken } from "../utils/token.js";
import User from "../models/UserModel.js";

export const authenticate = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return sendError(res, 401, "No authorization token provided");
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return sendError(res, 401, "Invalid or expired token");
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return sendError(res, 404, "User not found");
    }

    req.user = user;
    req.userId = decoded.id;
    next();
  } catch (error) {
    return sendError(res, 200, "Authentication error: " + error.message);
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];

    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        const user = await User.findById(decoded.id);
        if (user) {
          req.user = user;
          req.userId = decoded.id;
        }
      }
    }
    next();
  } catch (error) {
    next();
  }
};
