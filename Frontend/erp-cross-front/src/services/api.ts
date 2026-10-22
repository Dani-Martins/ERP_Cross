import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.DEV ? '/api' : 'http://localhost:5015/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;
