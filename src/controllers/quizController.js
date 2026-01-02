import { sendSuccess, sendError } from "../utils/response.js";
import Quiz from "../models/QuizModel.js";
import QuizAttempt from "../models/QuizAttempt.js";

export const createQuiz = async (req, res) => {
  try {
    const { title, description, duration, subject, questions } = req.body;

    if (!title || !questions || questions.length === 0) {
      return sendError(res, 400, "Title and questions are required");
    }

    const quiz = await Quiz.create({
      title,
      description,
      duration,
      subject,
      questions,
      user: req.userId,
      totalMarks: questions.length,
    });

    return sendSuccess(res, 201, "Quiz created successfully", quiz);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getAllQuizzes = async (req, res) => {
  try {
    const { subject } = req.query; // 👈 get subject from query

    const filter = {
      user: req.userId,
      isDeleted: false,
    };

    // 👇 apply subject filter only if provided
    if (subject) {
      filter.subject = subject;
    }

    const quizzes = await Quiz.find(filter).populate("subject", "name");

    return sendSuccess(res, 200, "Quizzes fetched successfully", quizzes);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("subject", "name");
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }
    return sendSuccess(res, 200, "Quiz fetched successfully", quiz);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const updateQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndUpdate(
      { _id: req.params.id, user: req.userId, isDeleted: false },
      req.body,
      { new: true, runValidators: true }
    );
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }
    return sendSuccess(res, 200, "Quiz updated successfully", quiz);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

// Save quiz attempt
export const saveQuizAttempt = async (req, res) => {
  try {
    const userId = req.userId;
    const { quizId, answers, score, timeTaken } = req.body;

    const quiz = await Quiz.findById(quizId);
    if (!quiz) return sendError(res, 404, "Quiz not found");

    const totalMarks = quiz.questions.length;
    const passed = score > (quiz.passingMarks || 0);

    const attempt = await QuizAttempt.create({
      quiz: quizId,
      user: userId,
      answers,
      score,
      totalMarks,
      passed,
      timeTaken,
    });

    return sendSuccess(res, 201, "Quiz completed", attempt);
  } catch (err) {
    return sendError(res, 500, err.message);
  }
};

// Optional: get all attempts for a user
export const getAllAttempts = async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id }).populate(
    "quiz"
  );
  res.json({ data: attempts });
};

export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    quiz.isDeleted = true;
    quiz.deletedAt = new Date();
    quiz.deletedBy = req.userId;
    await quiz.save();

    return sendSuccess(res, 200, "Quiz deleted successfully");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const startQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }
    return sendSuccess(res, 200, "Quiz started", { quiz });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const submitAnswer = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers) {
      return sendError(res, 400, "Answers are required");
    }

    const quiz = await Quiz.findById(req.params.id);
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    let score = 0;
    answers.forEach((answer, index) => {
      if (quiz.questions[index]?.correctAnswer === answer) {
        score++;
      }
    });

    quiz.attempts.push({
      userId: req.userId,
      answers,
      score,
      completedAt: new Date(),
    });

    await quiz.save();

    return sendSuccess(res, 200, "Quiz submitted successfully", {
      score,
      totalMarks: quiz.totalMarks,
      percentage: (score / quiz.totalMarks) * 100,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getResults = async (req, res) => {
  try {
    const quiz = await Quiz.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!quiz) {
      return sendError(res, 404, "Quiz not found");
    }

    const userAttempts = quiz.attempts.filter(
      (attempt) => attempt.userId.toString() === req.userId.toString()
    );

    return sendSuccess(res, 200, "Results fetched successfully", {
      attempts: userAttempts,
      totalAttempts: userAttempts.length,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
