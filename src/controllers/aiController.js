import { sendSuccess, sendError } from '../utils/response.js';
import * as aiService from '../services/aiService.js';

export const chat = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return sendError(res, 400, 'Message is required');
    }

    const response = await aiService.solveDoubts(message);
    return sendSuccess(res, 200, 'Response generated successfully', {
      response,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const generateMCQs = async (req, res) => {
  try {
    const { notesId, count } = req.body;

    if (!notesId) {
      return sendError(res, 400, 'Notes ID is required');
    }

    const mcqs = await aiService.generateMCQs('sample content', count || 10);
    return sendSuccess(res, 200, 'MCQs generated successfully', { mcqs });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const generateStudyPlan = async (req, res) => {
  try {
    const { availableHours, subjects } = req.body;

    if (!availableHours || !subjects) {
      return sendError(res, 400, 'Available hours and subjects are required');
    }

    const plan = await aiService.generateStudyPlan(availableHours, subjects);
    return sendSuccess(res, 200, 'Study plan generated successfully', { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const solveProblem = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return sendError(res, 400, 'Question is required');
    }

    const solution = await aiService.solveDoubts(question, context);
    return sendSuccess(res, 200, 'Solution generated successfully', {
      solution,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const generateWeeklyReport = async (req, res) => {
  try {
    const userStats = {
      studyHours: 10,
      topicsCovered: 5,
      quizzesTaken: 3,
    };

    const report = await aiService.generateWeeklyReport(userStats);
    return sendSuccess(res, 200, 'Weekly report generated successfully', {
      report,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
