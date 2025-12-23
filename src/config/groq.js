import axios from "axios";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const callGroq = async (model, messages) => {
  try {
    const response = await axios.post(
      GROQ_API_URL,
      {
        model,
        messages,
        temperature: 0.7,
        max_tokens: 800,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    console.error("GROQ ERROR:", error.response?.data || error.message);
    throw new Error(
      error.response?.data?.error?.message ||
        JSON.stringify(error.response?.data) ||
        error.message
    );
  }
};
