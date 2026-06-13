import { api } from './api';

export const getSchemes = async (page = 1, limit = 10, filters = {}) => {
  let url = `/api/schemes?page=${page}&limit=${limit}`;
  if (filters.state && filters.state !== 'All') url += `&state=${encodeURIComponent(filters.state)}`;
  if (filters.level && filters.level !== 'All') url += `&level=${encodeURIComponent(filters.level)}`;
  const response = await api.get(url);
  return response.data;
};

export const searchSchemes = async (query, filters = {}) => {
  let url = `/api/schemes/search?q=${encodeURIComponent(query)}`;
  if (filters.state && filters.state !== 'All') url += `&state=${encodeURIComponent(filters.state)}`;
  if (filters.level && filters.level !== 'All') url += `&level=${encodeURIComponent(filters.level)}`;
  const response = await api.get(url);
  return response.data;
};

export const getSchemeById = async (id) => {
  const response = await api.get(`/api/schemes/${id}`);
  return response.data;
};
