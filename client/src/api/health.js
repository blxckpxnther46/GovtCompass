import { api } from './api';

export const getHealth = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  if (!apiUrl) {
    throw new Error(
      'VITE_API_URL is not set. Create client/.env with VITE_API_URL=http://localhost:5000 (or set it in your environment).'
    );
  }

  const res = await api.get('/api/health');
  return res.data;
};

