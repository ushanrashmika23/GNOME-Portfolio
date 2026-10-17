// API Configuration - Powered by Cloudflare D1 & R2
export const API_BASE_URL = '';

// API Endpoints
export const API_ENDPOINTS = {
  PROJECTS: '/api/projects',
  VISITORS: '/api/visitors',
  VISITORS_UPDATE: '/api/visitors/update',
  EMAIL_SEND: '/api/contact',
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};