import api from './api.js';

export const commentService = {
  // Fetch comments for a video
  getComments: async (videoId, params = {}) => {
    return api.get(`/videos/${videoId}/comments`, { params });
  },

  // Create new comment
  createComment: async (videoId, content) => {
    return api.post(`/videos/${videoId}/comments`, { content });
  },

  // Delete comment
  deleteComment: async (commentId) => {
    return api.delete(`/comments/${commentId}`);
  }
};
