import { sendSuccess, sendError } from "../utils/response.js";
import Subject from "../models/SubjectModel.js";

export const createSubject = async (req, res) => {
  try {
    const { name, description, color } = req.body;

    if (!name) {
      return sendError(res, 400, "Subject name is required");
    }

    const subject = await Subject.create({
      name,
      description,
      color,
      user: req.userId,
    });

    return sendSuccess(res, 201, "Subject created successfully", subject);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getAllSubjects = async (req, res) => {
  try {
    const subjects = await Subject.find({ user: req.userId, isDeleted: false })
      .populate("notes")
      .populate("quizzes")
      .populate("flashcards");

    return sendSuccess(res, 200, "Subjects fetched successfully", subjects);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      isDeleted: false,
    }).populate("notes quizzes flashcards");
    if (!subject) {
      return sendError(res, 404, "Subject not found");
    }
    return sendSuccess(res, 200, "Subject fetched successfully", subject);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const updateSubject = async (req, res) => {
  try {
    const subject = await Subject.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!subject) {
      return sendError(res, 404, "Subject not found");
    }
    return sendSuccess(res, 200, "Subject updated successfully", subject);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const subject = await Subject.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!subject) {
      return sendError(res, 404, "Subject not found");
    }
    subject.isDeleted = true;
    subject.deletedAt = new Date();
    subject.deletedBy = req.userId;
    await subject.save();
    return sendSuccess(res, 200, "Subject deleted successfully");
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const addResource = async (req, res) => {
  try {
    const { resourceId, resourceType } = req.body;

    if (!resourceId || !resourceType) {
      return sendError(res, 400, "Resource ID and type are required");
    }

    const subject = await Subject.findOne({
      _id: req.params.id,
      isDeleted: false,
    });
    if (!subject) {
      return sendError(res, 404, "Subject not found");
    }

    if (resourceType === "note") {
      subject.notes.push(resourceId);
    } else if (resourceType === "quiz") {
      subject.quizzes.push(resourceId);
    } else if (resourceType === "flashcard") {
      subject.flashcards.push(resourceId);
    }

    await subject.save();
    return sendSuccess(res, 200, "Resource added successfully", subject);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
