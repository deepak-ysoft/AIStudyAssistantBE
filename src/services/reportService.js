import Report from '../models/ReportModel.js';
import User from '../models/UserModel.js';
import Quiz from '../models/QuizModel.js';
import Note from '../models/NotesModel.js';

export const generateWeeklyReport = async (userId) => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setDate(startDate.getDate() - 7);

  const quizzes = await Quiz.find({
    'attempts.userId': userId,
    'attempts.completedAt': { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const notes = await Note.find({
    user: userId,
    createdAt: { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const totalStudyHours = calculateStudyHours(quizzes);
  const averageScore = calculateAverageScore(quizzes);

  const report = await Report.create({
    user: userId,
    reportType: 'weekly',
    startDate,
    endDate,
    totalStudyHours,
    topicsCovered: notes.length,
    quizzesTaken: quizzes.length,
    averageScore,
    subjectPerformance: {},
  });

  return report;
};

export const generateMonthlyReport = async (userId) => {
  const endDate = new Date();
  const startDate = new Date(endDate);
  startDate.setMonth(startDate.getMonth() - 1);

  const quizzes = await Quiz.find({
    'attempts.userId': userId,
    'attempts.completedAt': { $gte: startDate, $lte: endDate },
    isDeleted: false,
  });

  const totalStudyHours = calculateStudyHours(quizzes);
  const averageScore = calculateAverageScore(quizzes);

  const report = await Report.create({
    user: userId,
    reportType: 'monthly',
    startDate,
    endDate,
    totalStudyHours,
    quizzesTaken: quizzes.length,
    averageScore,
  });

  return report;
};

export const getReportById = async (reportId) => {
  const report = await Report.findOne({ _id: reportId, isDeleted: false }).populate('user', 'name email');
  if (!report) {
    throw new Error('Report not found');
  }
  return report;
};

const calculateStudyHours = (quizzes) => {
  return quizzes.reduce((total, quiz) => {
    return total + (quiz.duration ? quiz.duration / 60 : 1);
  }, 0);
};

const calculateAverageScore = (quizzes) => {
  if (quizzes.length === 0) return 0;
  const totalScore = quizzes.reduce((sum, quiz) => {
    const attempts = quiz.attempts || [];
    const avgAttemptScore = attempts.length > 0
      ? attempts.reduce((sum, attempt) => sum + (attempt.score || 0), 0) / attempts.length
      : 0;
    return sum + avgAttemptScore;
  }, 0);
  return totalScore / quizzes.length;
};
