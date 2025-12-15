import { sendSuccess, sendError } from "../utils/response.js";
import * as notesService from "../services/notesService.js";
import * as aiService from "../services/aiService.js";

export const createNote = async (req, res) => {
  try {
    const { title, content, subject } = req.body;

    if (!title || !content) {
      return sendError(res, 400, "Title and content are required");
    }

    const noteData = {
      title,
      content,
      subject,
      user: req.userId,
    };

    const note = await notesService.createNote(noteData);
    return sendSuccess(res, 201, "Note created successfully", note);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const getNoteById = async (req, res) => {
  try {
    const note = await notesService.getNoteById(req.params.id);
    return sendSuccess(res, 200, "Note fetched successfully", note);
  } catch (error) {
    return sendError(res, 404, error.message);
  }
};

export const getAllNotes = async (req, res) => {
  try {
    const notes = await notesService.getAllNotesByUser(req.userId);
    return sendSuccess(res, 200, "Notes fetched successfully", notes);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const updateNote = async (req, res) => {
  try {
    const note = await notesService.updateNote(req.params.id, req.body);
    return sendSuccess(res, 200, "Note updated successfully", note);
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};

export const deleteNote = async (req, res) => {
  try {
    await notesService.deleteNote(req.params.id, req);
    return sendSuccess(res, 200, "Note deleted successfully");
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

export const uploadFile = async (req, res) => {
  try {
    if (!req.file) {
      return sendError(res, 400, "No file uploaded");
    }
    return sendSuccess(res, 200, "File uploaded successfully", {
      filePath: req.file.path,
      fileName: req.file.originalname,
    });
  } catch (error) {
    return sendError(res, 400, error.message);
  }
};
