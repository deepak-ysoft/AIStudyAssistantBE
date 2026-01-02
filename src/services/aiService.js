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

const SYSTEM_CHAT_PROMPT = `
You are an AI study assistant.

Behavior:
- Always be polite, calm, and respectful
- If the user's question is unclear or incomplete, respond gently and helpfully
- Never sound strict, robotic, or dismissive
- If you don't understand the question, say so humbly and ask for clarification
- Assume positive intent from the user at all times

Answering rules:
- Answer even if the question is simple or broad
- If a term is asked, give a clear definition
- Use bullet points when helpful
- Keep answers short, clear, and professional
- Do NOT refuse simple questions
- Do NOT blame the user for unclear input
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
Generate around ${count} flashcards.
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
export const generateQuiz = async (noteContent, count = 5) => {
  const prompt = `
Generate around ${count} multiple choice questions.

Rules:
- 4 options per question (A, B, C, D)
- Only ONE correct answer
- Short explanation (1 sentence)
- Follow EXACT format:

1. Question?
A) Option
B) Option
C) Option
D) Option
Correct: A
Explanation: ...

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
      content: `
Create a WEEKLY study plan.

IMPORTANT:
- Total study + break time for the ENTIRE WEEK must be exactly ${availableHours} hours
- Do NOT allocate ${availableHours} hours per day
- Breaks are conditional (follow system rules strictly)

Subjects:
${subjects.join(", ")}

FORMAT (follow strictly):

Monday:
- Subject A: x hours
- Break: 15 mins in every session >1 hour
- Subject B: z hours

Tuesday:
- ...

At the END:
Total weekly hours: ${availableHours}
`,
    },
  ]);

  return res.choices[0].message.content;
};

/* ---------------- DOUBT SOLVER ---------------- */
export const solveDoubts = async (question, history = []) => {
  const rawQuestion = String(question || "").trim();

  // Get last meaningful assistant message
  const lastAssistantMsg = [...history]
    .reverse()
    .find(
      (m) =>
        m.sender === "ai" &&
        typeof m.text === "string" &&
        m.text.trim().length > 20
    );

  const messages = [
    { role: "system", content: SYSTEM_CHAT_PROMPT },

    // Provide context ONLY ONCE
    ...(lastAssistantMsg
      ? [
          {
            role: "assistant",
            content: lastAssistantMsg.text.trim(),
          },
        ]
      : []),

    {
      role: "user",
      content: rawQuestion || "Explain the above",
    },
  ];

  const res = await callGroq(CHAT_MODEL, messages);
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
