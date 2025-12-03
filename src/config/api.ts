// API Configuration
export const API_BASE_URL = 'https://dev-journal-backend.vercel.app';

// API Endpoints
export const API_ENDPOINTS = {
  VISITORS: '/visitors/new',
  VISITORS_UPDATE: '/visitors/update',
  EMAIL_SEND: '/email/sendPFmsg'
} as const;

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};