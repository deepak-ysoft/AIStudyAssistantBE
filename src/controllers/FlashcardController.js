import { sendSuccess, sendError } from "../utils/response.js";
import Flashcard from "../models/FlashcardModel.js";
import * as notesService from "../services/notesService.js";
import FlashcardModel from "../models/FlashcardModel.js";
import * as aiService from "../services/aiService.js";

/* =========================
   CREATE FLASHCARD
========================= */
export const createFlashcard = async (req, res) => {
  try {
    const { question, answer, subject, note, difficulty } = req.body;

    if (!question || !answer) {
      return sendError(res, 400, "Question and answer are required");
    }

    const flashcard = await Flashcard.create({
      question,
      answer,
      subject,
      note,
      difficulty,
      user: req.userId,
    });

    return sendSuccess(res, 201, "Flashcard created successfully", flashcard);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   GENERATE FLASHCARDS (NOTES)
========================= */
export const generateAndSaveFlashcards = async (req, res) => {
  try {
    const note = await notesService.getNoteById(req.params.id);

    if (!note) {
      return sendError(res, 404, "Note not found");
    }

    const flashcardText = await aiService.generateFlashcards(note.content);
    console.log("flashcardText", flashcardText);

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

/* =========================
   GET ALL FLASHCARDS (USER)
========================= */
export const getAllFlashcards = async (req, res) => {
  try {
    const subject = req.query.subject;
    const filter = {
      user: req.userId,
      isDeleted: false,
    };
    if (subject) {
      filter.subject = subject;
    }

    const flashcards = await Flashcard.find(filter)
      .populate("subject", "name")
      .populate("note", "title")
      .sort({ createdAt: -1 });

    return sendSuccess(res, 200, "Flashcards fetched successfully", flashcards);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   GET FLASHCARD BY ID
========================= */
export const getFlashcardById = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      isDeleted: false,
    })
      .populate("subject", "name")
      .populate("note", "title");

    if (!flashcard) {
      return sendError(res, 404, "Flashcard not found");
    }

    return sendSuccess(res, 200, "Flashcard fetched successfully", flashcard);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   UPDATE FLASHCARD
========================= */
export const updateFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOneAndUpdate(
      { _id: req.params.id, user: req.userId },
      req.body,
      { new: true, runValidators: true }
    );

    if (!flashcard) {
      return sendError(res, 404, "Flashcard not found");
    }

    return sendSuccess(res, 200, "Flashcard updated successfully", flashcard);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   DELETE FLASHCARD
========================= */
export const deleteFlashcard = async (req, res) => {
  try {
    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.userId,
    });
    if (!flashcard) {
      return sendError(res, 404, "Flashcard not found");
    }

    flashcard.isDeleted = true;
    flashcard.deletedAt = new Date();
    flashcard.deletedBy = req.userId;
    await flashcard.save();

    return sendSuccess(res, 200, "Flashcard deleted successfully");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   MARK ANSWER (LEARNED / WRONG)
========================= */
export const reviewFlashcard = async (req, res) => {
  try {
    const { isCorrect } = req.body;

    const flashcard = await Flashcard.findOne({
      _id: req.params.id,
      user: req.userId,
      isDeleted: false,
    });

    if (!flashcard) {
      return sendError(res, 404, "Flashcard not found");
    }

    if (isCorrect) {
      flashcard.correctCount += 1;
    } else {
      flashcard.wrongCount += 1;
    }

    flashcard.lastReviewedAt = new Date();

    await flashcard.save();

    return sendSuccess(res, 200, "Flashcard reviewed successfully", {
      correctCount: flashcard.correctCount,
      wrongCount: flashcard.wrongCount,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

/* =========================
   GET FLASHCARDS BY SUBJECT
========================= */
export const getFlashcardsBySubject = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.userId,
      subject: req.params.subjectId,
      isDeleted: false,
    }).populate("subject", "name");

    return sendSuccess(res, 200, "Flashcards fetched successfully", flashcards);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
