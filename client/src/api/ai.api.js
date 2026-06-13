import { api } from './api';

export const explainScheme = async (schemeId) => {
  const response = await api.post('/api/ai/explain', { schemeId });
  return response.data;
};

export const analyzeEligibilityGap = async (schemeId, failedCriteria, profile) => {
  const response = await api.post('/api/ai/eligibility-gap', { schemeId, failedCriteria, profile });
  return response.data;
};

export const intakeProfileFromText = async (freeText) => {
  const response = await api.post('/api/ai/intake', { freeText });
  return response.data;
};

export const refineSchemes = async (query, schemes) => {
  const response = await api.post('/api/ai/refine', { query, schemes });
  return response.data;
};
