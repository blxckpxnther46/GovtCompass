import { api } from './api';

export const getRecommendationsFromAnswers = async (answers) => {
  const response = await api.post('/api/analyze', { answers });
  return response.data;
};

export const getRecommendationsFromProfile = async (profile) => {
  const response = await api.post('/api/recommendations', profile);
  return response.data;
};
