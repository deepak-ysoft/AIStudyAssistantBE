export const parseAndFormatPlan = (planText) => {
  return {
    rawPlan: planText,
    formattedAt: new Date(),
  };
};

export const saveTimetable = async (userId, plan) => {
  return {
    userId,
    plan: parseAndFormatPlan(plan),
    savedAt: new Date(),
  };
};

export const getTimetableForUser = async (userId) => {
  return {
    userId,
    timetable: null,
    message: 'No timetable found for user',
  };
};
