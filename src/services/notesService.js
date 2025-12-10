import Note from '../models/NotesModel.js';

export const createNote = async (noteData) => {
  const note = await Note.create(noteData);
  return note;
};

export const getNoteById = async (noteId) => {
  const note = await Note.findById(noteId).populate('subject', 'name');
  if (!note) {
    throw new Error('Note not found');
  }
  note.viewCount += 1;
  await note.save();
  return note;
};

export const getAllNotesByUser = async (userId, query = {}) => {
  const filter = { user: userId, ...query };
  const notes = await Note.find(filter).populate('subject', 'name').sort('-createdAt');
  return notes;
};

export const updateNote = async (noteId, updateData) => {
  const note = await Note.findByIdAndUpdate(noteId, updateData, {
    new: true,
    runValidators: true,
  });
  if (!note) {
    throw new Error('Note not found');
  }
  return note;
};

export const deleteNote = async (noteId) => {
  const note = await Note.findByIdAndDelete(noteId);
  if (!note) {
    throw new Error('Note not found');
  }
  return note;
};

export const addSummaryToNote = async (noteId, summary) => {
  const note = await Note.findByIdAndUpdate(
    noteId,
    { summary },
    { new: true }
  );
  return note;
};
