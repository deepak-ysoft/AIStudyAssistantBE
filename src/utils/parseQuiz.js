export const parseQuizFromAI = (text) => {
  const blocks = text.split(/\n(?=\d+\.)/);

  return blocks
    .map((block) => {
      const lines = block
        .split("\n")
        .map((l) => l.trim())
        .filter(Boolean);

      const question = lines[0].replace(/^\d+\.\s*/, "");

      const options = lines
        .filter((l) => /^[A-D]\)/.test(l))
        .map((l) => l.replace(/^[A-D]\)\s*/, ""));

      const correctLine = lines.find((l) => l.startsWith("Correct:"));
      const explanationLine = lines.find((l) => l.startsWith("Explanation:"));

      const correctLetter = correctLine?.split(":")[1].trim();
      const correctIndex = ["A", "B", "C", "D"].indexOf(correctLetter);

      return {
        question,
        options,
        correctAnswer: correctIndex,
        explanation: explanationLine
          ? explanationLine.replace("Explanation:", "").trim()
          : "",
      };
    })
    .filter((q) => q.options.length === 4 && q.correctAnswer >= 0);
};
