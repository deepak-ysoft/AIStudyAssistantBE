import axios from "axios";

const HF_API_URL = "https://router.huggingface.co/v1/chat/completions";

export const callHuggingFace = async (model, messages) => {
  try {
    const response = await axios.post(
      HF_API_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("HF RAW ERROR:", error.response?.data);
    throw new Error(
      error.response?.data?.error?.message ||
        JSON.stringify(error.response?.data) ||
        error.message
    );
  }
};
