import { callGroq } from "../config/groq.js";

const CHAT_MODEL = "llama-3.1-8b-instant";

const SYSTEM_PROMPT = `
You are an AI study assistant.
Rules:
- Be concise and direct
- Do NOT add extra explanations
- Do NOT add introductions or conclusions
- Use bullet points where possible
- Keep the response short and clear
`;

/* ---------------- SUMMARY ---------------- */
export const generateSummary = async (noteContent) => {
  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Summarize the content in 5 bullet points max:\n\n${noteContent}`,
    },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- FLASHCARDS ---------------- */
export const generateFlashcards = async (noteContent, count = 10) => {
  const prompt = `
Generate ${count} flashcards.
Rules:
- Only question and answer
- Max 2 sentences per answer
- Format:
Question: ...
Answer: ...

Content:
${noteContent}
`;

  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- MCQs ---------------- */
export const generateMCQs = async (noteContent, count = 10) => {
  const prompt = `
Generate exactly ${count} MCQs.
Rules:
- No explanations
- Only questions and answers
- Strictly follow format

Format:
1. Question?
A) ...
B) ...
C) ...
D) ...
Answer: X

Content:
${noteContent}
`;

  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    { role: "user", content: prompt },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- STUDY PLAN ---------------- */
export const generateStudyPlan = async (availableHours, subjects) => {
  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Create a weekly study plan.
Rules:
- Use bullet points
- Max 7 days
- No explanations

Hours: ${availableHours}
Subjects: ${subjects.join(", ")}`,
    },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- DOUBT SOLVER ---------------- */
export const solveDoubts = async (question, context = "") => {
  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `${
        context ? `Context: ${context}\n` : ""
      }Answer in short steps (max 5 points):\n${question}`,
    },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- WEEKLY REPORT ---------------- */
export const generateWeeklyReport = async (stats) => {
  const res = await callGroq(CHAT_MODEL, [
    { role: "system", content: SYSTEM_PROMPT },
    {
      role: "user",
      content: `Generate a weekly report.
Rules:
- Max 6 bullet points
- Short and actionable

Stats: ${JSON.stringify(stats)}`,
    },
  ]);

  return res.choices[0].message.content;
};
