import Subject from "../models/SubjectModel.js";
import Note from "../models/NotesModel.js";
import Pomodoro from "../models/PomodoroModel.js";
import QuizAttempt from "../models/QuizAttempt.js";
import { sendSuccess, sendError } from "../utils/response.js";
import { generateReportPDF } from "../utils/reportPdf.js";

/* ---------------- DATE RANGE ---------------- */
const getDateRange = (type) => {
  const end = new Date();
  const start = new Date();

  if (type === "weekly") start.setDate(end.getDate() - 7);
  else start.setMonth(end.getMonth() - 1);

  return { start, end };
};

/* ---------------- REPORT BUILDER ---------------- */
const buildReport = async (userId, start, end) => {
  /* ---------------- STUDY HOURS ---------------- */
  const sessions = await Pomodoro.find({
    user: userId,
    type: "WORK",
    completed: true,
    startedAt: { $gte: start, $lte: end },
  });

  const studySeconds = sessions.reduce((t, s) => t + s.duration, 0);
  const studyHours = Math.round(studySeconds / 3600);

  /* ---------------- SUBJECTS ---------------- */
  const subjects = await Subject.find({
    user: userId,
    isDeleted: false,
  });

  /* ---------------- QUIZ ATTEMPTS ---------------- */
  const attempts = await QuizAttempt.find({
    user: userId,
    completedAt: { $gte: start, $lte: end },
  }).populate({
    path: "quiz",
    select: "subject",
    populate: { path: "subject", select: "name" },
  });

  let quizAverage = 0;
  const subjectStats = {}; // { subjectName: { score, total } }

  attempts.forEach((a) => {
    if (!a.quiz?.subject) return;

    const subjectName = a.quiz.subject.name;

    if (!subjectStats[subjectName]) {
      subjectStats[subjectName] = { score: 0, total: 0 };
    }

    subjectStats[subjectName].score += (a.score / a.totalMarks) * 100;
    subjectStats[subjectName].total += 1;
  });

  /* ---------------- CALCULATIONS ---------------- */
  if (attempts.length) {
    const totalPercentage = attempts.reduce(
      (sum, a) => sum + (a.score / a.totalMarks) * 100,
      0
    );
    quizAverage = Math.round(totalPercentage / attempts.length);
  }

  const subjectPerformance = Object.entries(subjectStats).reduce(
    (acc, [subject, data]) => {
      acc[subject] = Math.round(data.score / data.total);
      return acc;
    },
    {}
  );

  return {
    studyHours,
    topicsCovered: subjects.length,
    quizAverage,
    improvement: Math.min(Math.floor(quizAverage / 5), 100),
    subjectPerformance,
    recommendations: [
      "Revise weak subjects regularly",
      "Maintain daily Pomodoro sessions",
      "Attempt quizzes after revision",
    ],
    insights:
      "Your consistency is improving. Keep focusing on daily practice and revision.",
  };
};

/* ---------------- DASHBOARD ---------------- */
export const getDashboardData = async (req, res) => {
  try {
    const userId = req.userId;

    /* ---------- BASIC STATS ---------- */
    const [subjectsCount, notesCount, quizzesCompleted] = await Promise.all([
      Subject.countDocuments({ user: userId, isDeleted: false }),
      Note.countDocuments({ user: userId, isDeleted: false }),
      QuizAttempt.countDocuments({ user: userId }),
    ]);

    /* ---------- STUDY STREAK ---------- */
    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const streakSessions = await Pomodoro.find({
      user: userId,
      type: "WORK",
      completed: true,
      startedAt: { $gte: last7Days },
    });

    const studyStreak = Math.min(
      new Set(
        streakSessions.map((s) => s.startedAt.toISOString().split("T")[0])
      ).size,
      7
    );

    /* ---------- RECENT ACTIVITY ---------- */
    const recentNotes = await Note.find({
      user: userId,
      isDeleted: false,
    })
      .sort({ createdAt: -1 })
      .limit(6);

    const recentAttempts = await QuizAttempt.find({ user: userId })
      .sort({ completedAt: -1 })
      .limit(3)
      .populate("quiz");

    const recentActivity = [
      ...recentNotes.map((n) => ({
        type: "note",
        title: `Created note: ${n.title}`,
        time: n.createdAt,
      })),
      ...recentAttempts.map((a) => ({
        type: "quiz",
        title: `Completed quiz: ${a.quiz?.title}`,
        time: a.completedAt,
      })),
    ].sort((a, b) => new Date(b.time) - new Date(a.time));

    /* ---------- REPORTS ---------- */
    const weeklyRange = getDateRange("weekly");
    const monthlyRange = getDateRange("monthly");

    const [weeklyReport, monthlyReport] = await Promise.all([
      buildReport(userId, weeklyRange.start, weeklyRange.end),
      buildReport(userId, monthlyRange.start, monthlyRange.end),
    ]);

    return sendSuccess(res, 200, "Dashboard data", {
      stats: {
        totalSubjects: subjectsCount,
        studyStreak: `${studyStreak} days`,
        notesCreated: notesCount,
        quizzesCompleted,
      },
      recentActivity,
      reports: {
        weekly: weeklyReport,
        monthly: monthlyReport,
      },
    });
  } catch (err) {
    return sendError(res, 200, err.message);
  }
};

export const downloadReport = async (req, res) => {
  try {
    const userId = req.userId;
    const type = req.query.type || "weekly";

    const { start, end } = getDateRange(type);
    const report = await buildReport(userId, start, end);

    // ❌ DO NOT use sendSuccess here
    return generateReportPDF(res, report, type);
  } catch (err) {
    res.status(500).json({ message: "Failed to generate PDF" });
  }
};
