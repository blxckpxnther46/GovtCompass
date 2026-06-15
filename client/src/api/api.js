import axios from 'axios';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': import.meta.env.VITE_API_KEY,
  },
});

// Intercept requests to dynamically attach the current session ID
api.interceptors.request.use((config) => {
  const sessionId = localStorage.getItem('sessionId');
  if (sessionId) {
    config.headers['X-Session-ID'] = sessionId;
  }
  return config;
});

// Intercept responses to handle session expiration (401)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Session expired or invalid. Clearing session ID.');
      localStorage.removeItem('sessionId');
      sessionStorage.removeItem('cachedRecommendations');
      sessionStorage.removeItem('cachedRecommendationsPage');
      sessionStorage.removeItem('hasSeenLoading');
      
      // Redirect to home page if not already there, so a new session can be initialized
      if (window.location.pathname !== '/') {
        window.location.href = '/';
      }
    }
    return Promise.reject(error);
  }
);

