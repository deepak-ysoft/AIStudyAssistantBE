import StudyPlanModel from "../models/StudyPlanModel.js";
import { sendError, sendSuccess } from "../utils/response.js";

/* GET PLAN */
export const getStudyPlan = async (req, res) => {
  try {
    const plan = await StudyPlanModel.findOne({ userId: req.user.id });

    if (!plan) {
      return sendSuccess(res, 200, "No study plan found", { plan: null });
    }

    return sendSuccess(res, 200, "Study plan fetched", {
      plan: plan.planText,
    });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

/* CLEAR PLAN */
export const clearStudyPlan = async (req, res) => {
  try {
    await StudyPlanModel.deleteOne({ userId: req.user.id });
    return sendSuccess(res, 200, "Study plan cleared");
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};
