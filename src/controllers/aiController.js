import { sendSuccess, sendError } from "../utils/response.js";
import * as aiService from "../services/aiService.js";
import * as notesService from "../services/notesService.js";
import FlashcardModel from "../models/FlashcardModel.js";
import QuizModel from "../models/QuizModel.js";
import SubjectModel from "../models/SubjectModel.js";
import { parseQuizFromAI } from "../utils/parseQuiz.js";

export const chat = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (!message) {
      return sendError(res, 400, "Message is required");
    }

    const response = await aiService.solveDoubts(message, history);

    return sendSuccess(res, 200, "Response generated successfully", {
      response,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const generateQuizFromNote = async (req, res) => {
  try {
    const note = await notesService.getNoteById(req.params.id);
    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    // 🔹 Generate quiz from AI
    const aiText = await aiService.generateQuiz(note.content, 5);
    const questions = parseQuizFromAI(aiText);

    if (!questions.length) {
      return sendError(res, 400, "Failed to generate quiz questions");
    }

    // 🔹 Delete existing quiz for same note + user
    await QuizModel.deleteMany({
      user: req.user._id,
      subject: note.subject,
      title: `Quiz: ${note.title}`,
    });

    // 🔹 Create quiz
    const quiz = await QuizModel.create({
      title: `Quiz: ${note.title}`,
      description: `Auto-generated quiz from note "${note.title}"`,
      user: req.user._id,
      subject: note.subject,
      questions,
      duration: questions.length,
      totalMarks: questions.length,
      passingMarks: Math.ceil(questions.length * 0.5),
    });

    // 🔹 Attach quiz to subject
    await SubjectModel.findByIdAndUpdate(note.subject, {
      $push: { quizzes: quiz._id },
    });

    return sendSuccess(res, 201, "Quiz generated successfully", quiz);
  } catch (error) {
    console.error(error);
    return sendError(res, 500, error.message);
  }
};

export const generateAndSaveFlashcards = async (req, res) => {
  try {
    const note = await notesService.getNoteById(req.params.id);

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    const flashcardText = await aiService.generateFlashcards(note.content);

    // Parse AI response (numbered list style)
    const flashcards = flashcardText
      .split("\n")
      .filter((line) => line.trim())
      .reduce((acc, line) => {
        const questionMatch = line.match(/^\d+\.\s*(.+)/); // Matches "1. Question text"
        const answerMatch = line.match(/^Answer:\s*(.+)/i);

        if (questionMatch) {
          acc.push({ question: questionMatch[1].trim(), answer: "" });
        } else if (answerMatch && acc.length > 0) {
          acc[acc.length - 1].answer = answerMatch[1].trim();
        }

        return acc;
      }, []);

    if (!flashcards.length) {
      return sendError(res, 400, "No flashcards found in AI response");
    }

    // Delete existing flashcards for this note & user
    await FlashcardModel.deleteMany({ note: note._id, user: req.user._id });

    // Save new flashcards in DB
    const savedFlashcards = await FlashcardModel.insertMany(
      flashcards.map((fc) => ({
        ...fc,
        user: req.user._id,
        subject: note.subject,
        note: note._id,
      }))
    );

    return sendSuccess(
      res,
      200,
      "Flashcards generated successfully",
      savedFlashcards
    );
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const generateSummary = async (req, res) => {
  try {
    const note = await notesService.getNoteById(req.params.id);
    const summary = await aiService.generateSummary(note.content);
    const updatedNote = await notesService.addSummaryToNote(
      req.params.id,
      summary
    );
    return sendSuccess(res, 200, "Summary generated successfully", updatedNote);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const generateStudyPlan = async (req, res) => {
  try {
    const { availableHours, subjects } = req.body;

    if (!availableHours || !subjects) {
      return sendError(res, 400, "Available hours and subjects are required");
    }

    const plan = await aiService.generateStudyPlan(availableHours, subjects);
    return sendSuccess(res, 200, "Study plan generated successfully", { plan });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const solveProblem = async (req, res) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return sendError(res, 400, "Question is required");
    }

    const solution = await aiService.solveDoubts(question, context);
    return sendSuccess(res, 200, "Solution generated successfully", {
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
    return sendSuccess(res, 200, "Weekly report generated successfully", {
      report,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
