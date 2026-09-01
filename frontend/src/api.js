import axios from 'axios';

// In development, hit services directly. In production, use the gateway.
const AUTH_URL = process.env.REACT_APP_AUTH_URL || 'http://localhost:8081';
const APP_URL = process.env.REACT_APP_APP_URL || 'http://localhost:8082';
const RISK_URL = process.env.REACT_APP_RISK_URL || 'http://localhost:8083';
const DECISION_URL = process.env.REACT_APP_DECISION_URL || 'http://localhost:8084';
const AUDIT_URL = process.env.REACT_APP_AUDIT_URL || 'http://localhost:8085';

function createClient(baseURL) {
  const client = axios.create({
    baseURL,
    headers: { 'Content-Type': 'application/json' },
  });

  client.interceptors.request.use((config) => {
    const token = localStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }
  );

  return client;
}

const authClient = createClient(AUTH_URL);
const appClient = createClient(APP_URL);
const auditClient = createClient(AUDIT_URL);

// Unified API that routes to the right service
const api = {
  post: (url, data) => {
    if (url.startsWith('/api/auth')) return authClient.post(url, data);
    return appClient.post(url, data);
  },
  get: (url, config) => {
    if (url.startsWith('/api/auth')) return authClient.get(url, config);
    if (url.startsWith('/api/audit')) return auditClient.get(url, config);
    return appClient.get(url, config);
  },
  put: (url, data, config) => {
    if (url.startsWith('/api/decisions')) {
      return axios.create({ baseURL: DECISION_URL, headers: { 'Content-Type': 'application/json' } }).put(url, data, config);
    }
    if (url.startsWith('/api/customers')) return authClient.put(url, data, config);
    return appClient.put(url, data, config);
  },
  delete: (url) => {
    if (url.startsWith('/api/customers')) return authClient.delete(url);
    return appClient.delete(url);
  },
};

export default api;
