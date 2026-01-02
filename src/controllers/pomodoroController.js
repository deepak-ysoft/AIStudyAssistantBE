import { sendSuccess, sendError } from "../utils/response.js";
import Pomodoro from "../models/PomodoroModel.js";

export const startSession = async (req, res) => {
  try {
    const { type, duration } = req.body;

    if (!type || !duration) {
      return sendError(res, 200, "Type and duration are required");
    }

    const session = await Pomodoro.create({
      user: req.userId,
      type,
      duration,
      startedAt: new Date(),
    });

    return sendSuccess(res, 201, "Session started", session);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const endSession = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await Pomodoro.findOne({
      _id: sessionId,
      user: req.userId,
    });

    if (!session) {
      return sendError(res, 404, "Session not found");
    }

    session.endedAt = new Date();
    session.completed = true;
    await session.save();

    return sendSuccess(res, 200, "Session ended", session);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const getTodayStats = async (req, res) => {
  try {
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const sessions = await Pomodoro.find({
      user: req.userId,
      startedAt: { $gte: startOfDay },
      completed: true,
    });

    const totalFocusSeconds = sessions
      .filter((s) => s.type === "WORK")
      .reduce((sum, s) => sum + s.duration, 0);

    return sendSuccess(res, 200, "Today's stats", {
      totalFocusSeconds,
      sessions: sessions.length,
    });
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};

export const getHistory = async (req, res) => {
  try {
    const history = await Pomodoro.find({ user: req.userId }).sort({
      startedAt: -1,
    });

    return sendSuccess(res, 200, "History fetched", history);
  } catch (error) {
    return sendError(res, 200, error.message);
  }
};
