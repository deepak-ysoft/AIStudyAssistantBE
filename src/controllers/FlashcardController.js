import { sendSuccess, sendError } from "../utils/response.js";
import Flashcard from "../models/FlashcardModel.js";

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
   GET ALL FLASHCARDS (USER)
========================= */
export const getAllFlashcards = async (req, res) => {
  try {
    const flashcards = await Flashcard.find({
      user: req.userId,
      isDeleted: false,
    })
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
