import Note from "../models/NotesModel.js";

export const createNote = async (noteData) => {
  const note = await Note.create(noteData);
  return note;
};

export const getNoteById = async (noteId) => {
  const note = await Note.findOne({ _id: noteId, isDeleted: false }).populate(
    "subject",
    "name"
  );
  if (!note) {
    throw new Error("Note not found");
  }
  note.viewCount += 1;
  await note.save();
  return note;
};

export const getAllNotesByUser = async (userId, subject, query = {}) => {
  const filter = { user: userId, ...query, isDeleted: false };
  if (subject) {
    filter.subject = subject;
  }
  const notes = await Note.find(filter)
    .populate("subject", "name")
    .sort("-createdAt");
  return notes;
};

export const updateNote = async (noteId, updateData) => {
  const note = await Note.findByIdAndUpdate(noteId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!note) {
    throw new Error("Note not found");
  }
  return note;
};

export const deleteNote = async (noteId, req) => {
  const note = await Note.findOne({ _id: noteId, isDeleted: false });
  if (!note) {
    throw new Error("Note not found");
  }

  note.isDeleted = true;
  note.deletedAt = new Date();
  note.deletedBy = req.userId;
  await note.save();
  return note;
};

export const addSummaryToNote = async (noteId, summary) => {
  const note = await Note.findByIdAndUpdate(noteId, { summary }, { new: true });
  return note;
};
