import mongoose from "mongoose";

const studyPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one active plan per user
    },

    availableHours: {
      type: Number,
      required: true,
    },

    subjects: {
      type: [String],
      required: true,
    },

    planText: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("StudyPlan", studyPlanSchema);
