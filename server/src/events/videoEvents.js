import { EventEmitter } from 'events';
import { logger } from '../config/logger.js';

class VideoEventEmitter extends EventEmitter {}

export const videoEventEmitter = new VideoEventEmitter();

// Video Upload Event Listener
videoEventEmitter.on('video:uploaded', (data) => {
  logger.info(`[Event] Video Uploaded successfully: "${data.title}"`, {
    videoId: data.videoId,
    creatorId: data.creatorId,
    sizeBytes: data.size,
    category: data.category
  });
});

// Video Streamed Event Listener (HTTP 206 chunk requested)
videoEventEmitter.on('video:streamed', (data) => {
  logger.stream(`[Event] Video Chunk Streamed for video: ${data.videoId}`, {
    range: data.range,
    ip: data.ip
  });
});

// Video Deleted Event Listener
videoEventEmitter.on('video:deleted', (data) => {
  logger.warn(`[Event] Video Deleted from system: ${data.videoId}`, {
    videoId: data.videoId,
    videoFileName: data.videoFileName,
    deletedBy: data.deletedBy
  });
});
