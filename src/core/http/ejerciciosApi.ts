import axios from 'axios';

const GATEWAY_URL = (import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8080').replace(/\/$/, '');

export const ejerciciosApi = axios.create({
  baseURL: `${GATEWAY_URL}/api/v1`,
  headers: { 'Content-Type': 'application/json' },
});
