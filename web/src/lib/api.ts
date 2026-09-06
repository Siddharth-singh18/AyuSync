import axios from 'axios';

/**
 * Normalizes the backend base URL so that both REST and WebSockets
 * can share VITE_API_URL regardless of whether /api or trailing slashes are present.
 */
const rawUrl = (import.meta.env.VITE_API_URL || 'https://ayusync-backend.onrender.com').trim();

// Root server host (e.g., https://ayusync-backend.onrender.com)
export const getBaseServerUrl = (): string => {
  return rawUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '');
};

// REST API base URL (e.g., https://ayusync-backend.onrender.com/api)
export const getApiBaseUrl = (): string => {
  return `${getBaseServerUrl()}/api`;
};

const api = axios.create({
  baseURL: getApiBaseUrl(),
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('ayusync_token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Clear token on unauthorized
      localStorage.removeItem('ayusync_token');
      localStorage.removeItem('ayusync_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
export { api };
