import mongoose from 'mongoose';

const flashcardSchema = new mongoose.Schema(
  {
    question: {
      type: String,
      required: [true, 'Please provide question'],
    },
    answer: {
      type: String,
      required: [true, 'Please provide answer'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
    note: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Note',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
    correctCount: {
      type: Number,
      default: 0,
    },
    wrongCount: {
      type: Number,
      default: 0,
    },
    lastReviewedAt: Date,
    nextReviewDate: Date,
  },
  { timestamps: true }
);

export default mongoose.model('Flashcard', flashcardSchema);
