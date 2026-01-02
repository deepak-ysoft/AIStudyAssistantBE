import ChatMessage from "../models/ChatModel.js";
import { sendError, sendSuccess } from "../utils/response.js";

export const getChatHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const messages = await ChatMessage.find({ userId })
      .sort({ createdAt: 1 })
      .lean();

    return sendSuccess(res, 200, "Chat history fetched", { messages });
  } catch (error) {
    return sendError(res, 500, error.message);
  }
};

export const deleteMessage = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const message = await ChatMessage.findOne({ _id: id, userId });

  if (!message) {
    return sendError(res, 404, "Message not found");
  }

  if (message.deleted) {
    // hard delete
    await message.deleteOne();
  } else {
    // soft delete
    message.text = "Message is deleted";
    message.deleted = true;
    await message.save();
  }

  return sendSuccess(res, 200, "Message deleted");
};

export const clearChat = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await ChatMessage.deleteMany({ userId });

    return sendSuccess(res, 200, "Chat cleared successfully", {
      deletedCount: result.deletedCount,
    });
  } catch (error) {
    console.error("Clear chat error:", error);
    return sendError(res, 500, error.message);
  }
};
