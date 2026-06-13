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

export const getRecommendationsFromSession = async () => {
  // Send cached answers as body so server always has data, even after a restart
  let cachedAnswers = {};
  try {
    cachedAnswers = JSON.parse(localStorage.getItem('cachedAnswers') || '{}');
  } catch(e) {}
  const response = await api.post('/api/analyze', cachedAnswers);
  return response.data;
};
