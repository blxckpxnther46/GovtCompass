import { getQuestions, getFirstQuestion as getFirstQuestionConfig } from '../data/questions.js';

function getAllQuestions(req, res) {
  res.json({
    success: true,
    data: {
      questions: getQuestions(),
    },
  });
}

function getFirstQuestion(req, res) {
  const first = getFirstQuestionConfig();
  res.json({
    success: true,
    data: {
      question: first,
    },
  });
}

export { getAllQuestions, getFirstQuestion };
