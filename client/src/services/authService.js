import api from './api.js';

export const authService = {
  // Register user
  register: async (userData) => {
    return api.post('/auth/register', userData);
  },

  // Login user
  login: async (credentials) => {
    return api.post('/auth/login', credentials);
  },

  // Get current user profile
  getMe: async () => {
    return api.get('/auth/me');
  },

  // Toggle follow/unfollow a creator channel
  toggleFollow: async (creatorId) => {
    return api.post(`/auth/follow/${creatorId}`);
  },

  // Get recommended channels for Twitch sidebar
  getRecommendedChannels: async () => {
    return api.get('/auth/channels');
  }
};
