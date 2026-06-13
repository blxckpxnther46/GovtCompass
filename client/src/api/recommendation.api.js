import { api } from './api';

export const getRecommendationsFromAnswers = async (answers) => {
  const response = await api.post('/api/analyze', answers);
  return response.data;
};

export const getRecommendationsFromProfile = async (profile) => {
  const response = await api.post('/api/recommendations', profile);
  return response.data.data;
};

export const scoreSingleScheme = async (schemeId, profile) => {
  const response = await api.post('/api/recommendations/score-single', { schemeId, profile });
  return response.data.matching_data;
};

export const getRecommendationsFromSession = async (page = 1, limit = 10) => {
  const response = await api.post(`/api/analyze?page=${page}&limit=${limit}`, {});
  return response.data;
};
