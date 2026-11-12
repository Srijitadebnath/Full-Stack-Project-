// Central API Base URL Configuration
// In development: uses Vite's proxy '/api' pointing to http://localhost:5000
// In production: uses import.meta.env.VITE_API_URL (e.g. https://your-backend.render.com/api)
export const API_BASE = import.meta.env.VITE_API_URL || '/api';
