import { api } from './api';

export const getSchemes = async (page = 1, limit = 10) => {
  const response = await api.get(`/api/schemes?page=${page}&limit=${limit}`);
  return response.data;
};

export const searchSchemes = async (query) => {
  const response = await api.get(`/api/schemes/search?q=${encodeURIComponent(query)}`);
  return response.data;
};

export const getSchemeById = async (id) => {
  const response = await api.get(`/api/schemes/${id}`);
  return response.data;
};
