import mongoose from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Please provide quiz title"],
      trim: true,
    },
    description: String,
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
    },
    questions: [
      {
        question: String,
        options: [String],
        correctAnswer: {
          type: Number,
          min: 0,
          max: 3,
        },
        explanation: String,
      },
    ],
    duration: {
      type: Number,
      default: null,
    },
    totalMarks: {
      type: Number,
      default: 0,
    },
    passingMarks: {
      type: Number,
      default: 0,
    },
    attempts: [
      {
        userId: mongoose.Schema.Types.ObjectId,
        answers: [Number],
        score: Number,
        completedAt: Date,
      },
    ],
    isDeleted: { type: Boolean, default: false },
    deletedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Quiz", quizSchema);
