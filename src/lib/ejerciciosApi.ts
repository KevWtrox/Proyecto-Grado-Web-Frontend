import axios from 'axios';

const EXERCISES_API_URL = import.meta.env.VITE_EXERCISES_BACKEND_URL || 'http://127.0.0.1:8002';

export const ejerciciosApi = axios.create({
  baseURL: EXERCISES_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
