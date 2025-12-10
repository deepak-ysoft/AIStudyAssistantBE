import { getGeminiModel } from '../config/gemini.js';

const model = getGeminiModel();

export const generateSummary = async (noteContent) => {
  try {
    const prompt = `Please create a concise summary of the following notes:\n\n${noteContent}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Failed to generate summary: ' + error.message);
  }
};

export const generateMCQs = async (noteContent, count = 10) => {
  try {
    const prompt = `Generate exactly ${count} multiple choice questions based on the following notes. Format each question as: Question number. Question text? A) Option A B) Option B C) Option C D) Option D\nCorrect Answer: X\n\nNotes:\n${noteContent}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Failed to generate MCQs: ' + error.message);
  }
};

export const generateStudyPlan = async (availableHours, subjects) => {
  try {
    const subjectsList = subjects.join(', ');
    const prompt = `Create a detailed weekly study plan for a student with ${availableHours} hours available per week for the following subjects: ${subjectsList}. Include daily study schedule, topics to cover, and time allocation for each subject.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Failed to generate study plan: ' + error.message);
  }
};

export const solveDoubts = async (question, context = '') => {
  try {
    const prompt = `${context ? `Context: ${context}\n\n` : ''}Question: ${question}\n\nPlease provide a detailed explanation and answer.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Failed to solve doubt: ' + error.message);
  }
};

export const generateWeeklyReport = async (userStats) => {
  try {
    const statsStr = JSON.stringify(userStats);
    const prompt = `Based on these study statistics: ${statsStr}\n\nGenerate a comprehensive weekly performance report with insights, strengths, areas for improvement, and recommendations.`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    throw new Error('Failed to generate report: ' + error.message);
  }
};
