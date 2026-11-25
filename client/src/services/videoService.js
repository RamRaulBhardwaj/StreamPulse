import api from './api.js';

export const videoService = {
  // Fetch streams/videos with search, category, sort, pagination
  getVideos: async (params = {}) => {
    return api.get('/videos', { params });
  },

  // Fetch single stream/video by ID (increments views)
  getVideoById: async (id) => {
    return api.get(`/videos/${id}`);
  },

  // Stream URL helper (HTML5 video src, 206 Partial Content)
  getStreamUrl: (id) => {
    return `/api/videos/${id}/stream`;
  },

  // Thumbnail URL helper
  getThumbnailUrl: (filename) => {
    if (!filename) return null;
    return `/uploads/thumbnails/${filename}`;
  },

  // Upload video and thumbnail with live progress tracking
  uploadVideo: async (formData, onProgress) => {
    return api.post('/videos', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: (progressEvent) => {
        if (progressEvent.total) {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (onProgress) {
            onProgress(percentCompleted, progressEvent.loaded, progressEvent.total);
          }
        }
      }
    });
  },

  // Update video metadata
  updateVideo: async (id, updateData) => {
    return api.put(`/videos/${id}`, updateData);
  },

  // Delete video (cascades cleanup)
  deleteVideo: async (id) => {
    return api.delete(`/videos/${id}`);
  },

  // Toggle Like / Unlike
  toggleLike: async (id) => {
    return api.post(`/videos/${id}/like`);
  },

  // Aggregation statistics (Unit 5 requirement)
  getVideoStats: async () => {
    return api.get('/videos/analytics');
  }
};
