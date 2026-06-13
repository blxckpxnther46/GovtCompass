import { api } from './api';

export const getAllQuestions = async () => {
  const response = await api.get('/api/questions');
  return response.data;
};

export const getFirstQuestion = async () => {
  const response = await api.get('/api/questions/first');
  return response.data;
};

export const createSession = async () => {
  const response = await api.post('/api/session/create');
  // Automatically save the session ID to local storage when created
  if (response.data.success && response.data.sessionId) {
    localStorage.setItem('sessionId', response.data.sessionId);
  }
  return response.data;
};

export const submitAnswer = async (questionId, answer) => {
  const response = await api.post('/api/session/answer', { questionId, answer });
  return response.data;
};

export const getCurrentSession = async () => {
  const response = await api.get('/api/session/me');
  return response.data;
};
