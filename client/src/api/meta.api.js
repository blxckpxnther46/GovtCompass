import { api } from './api';

export const getCategories = async () => {
  const response = await api.get('/api/meta/categories');
  return response.data;
};

export const getTags = async () => {
  const response = await api.get('/api/meta/tags');
  return response.data;
};
