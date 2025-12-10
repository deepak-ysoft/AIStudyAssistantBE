import { sendSuccess, sendError } from '../utils/response.js';
import * as reportService from '../services/reportService.js';

export const getWeeklyReport = async (req, res) => {
  try {
    const report = await reportService.generateWeeklyReport(req.userId);
    return sendSuccess(res, 200, 'Weekly report generated successfully', report);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const report = await reportService.generateMonthlyReport(req.userId);
    return sendSuccess(res, 200, 'Monthly report generated successfully', report);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getPerformanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    return sendSuccess(res, 200, 'Performance stats fetched successfully', {
      studyHours: 15,
      quizzesTaken: 5,
      averageScore: 85,
      subjectsLearned: 3,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const exportReport = async (req, res) => {
  try {
    const { type, format } = req.query;

    if (!type || !format) {
      return sendError(res, 400, 'Type and format are required');
    }

    return sendSuccess(res, 200, 'Report exported successfully', {
      fileUrl: `/exports/report.${format}`,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getStreakData = async (req, res) => {
  try {
    return sendSuccess(res, 200, 'Streak data fetched successfully', {
      currentStreak: 7,
      longestStreak: 15,
      totalDaysStudied: 45,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
