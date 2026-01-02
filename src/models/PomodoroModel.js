import mongoose from "mongoose";

const pomodoroSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["WORK", "BREAK"],
      required: true,
    },
    duration: {
      type: Number, // seconds
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    endedAt: Date,
    completed: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Pomodoro", pomodoroSchema);
