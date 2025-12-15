import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    reportType: {
      type: String,
      enum: ["weekly", "monthly", "custom"],
      default: "weekly",
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    totalStudyHours: {
      type: Number,
      default: 0,
    },
    topicsCovered: {
      type: Number,
      default: 0,
    },
    quizzesTaken: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    subjectPerformance: {
      type: Map,
      of: Number,
    },
    strengths: [String],
    areasOfImprovement: [String],
    aiInsights: String,
    recommendations: [String],
    improvement: {
      type: Number,
      default: 0,
    },
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

export default mongoose.model("Report", reportSchema);
