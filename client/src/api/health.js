import { api } from './api';

export const getHealth = async () => {
  const res = await api.get('/api/health');
  return res.data;
};

