import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Comment } from './Comment.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Video title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      default: ''
    },
    videoFileName: {
      type: String,
      required: [true, 'Video file name is required']
    },
    thumbnailFileName: {
      type: String,
      default: ''
    },
    mimeType: {
      type: String,
      default: 'video/mp4'
    },
    size: {
      type: Number,
      required: [true, 'Video file size is required'],
      min: 0
    },
    views: {
      type: Number,
      default: 0,
      min: 0
    },
    isLive: {
      type: Boolean,
      default: false
    },
    duration: {
      type: String,
      default: '12:30'
    },
    category: {
      type: String,
      required: [true, 'Video category is required'],
      enum: {
        values: ['Vlog', 'Sports', 'Movies', 'Tech', 'Music', 'Gaming', 'Education', 'Coding', 'IRL', 'Just Chatting', 'Other'],
        message: '{VALUE} is not a supported category'
      },
      index: true
    },
    tags: [
      {
        type: String,
        trim: true,
        lowercase: true
      }
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      }
    ],
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Video creator reference is required']
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
  }
);

// Compound Index: Category and Creation Date (for high-speed category filtering and sorting)
videoSchema.index({ category: 1, createdAt: -1 });

// Text Index: Title, Description, and Tags (for full-text search)
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });

// Virtual: likesCount
videoSchema.virtual('likesCount').get(function () {
  return Array.isArray(this.likes) ? this.likes.length : 0;
});

// Virtual populate for comments (stream chat)
videoSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'video'
});

// Static Method: Find by category with pagination
videoSchema.statics.findByCategory = function (category, page = 1, limit = 10) {
  const query = category && category !== 'All' ? { category } : {};
  return this.find(query)
    .sort({ createdAt: -1 })
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('creator', 'name avatar role followers');
};

// Static Method: Aggregation Pipeline for Category Analytics & Views (Unit 5 Requirement)
videoSchema.statics.getCategoryAnalytics = async function () {
  return this.aggregate([
    {
      $facet: {
        categoryBreakdown: [
          {
            $group: {
              _id: '$category',
              videoCount: { $sum: 1 },
              totalViews: { $sum: '$views' },
              avgSize: { $avg: '$size' }
            }
          },
          { $sort: { totalViews: -1, videoCount: -1 } }
        ],
        overview: [
          {
            $group: {
              _id: null,
              totalPlatformVideos: { $sum: 1 },
              totalPlatformViews: { $sum: '$views' },
              totalPlatformBytes: { $sum: '$size' }
            }
          }
        ],
        topVideos: [
          { $sort: { views: -1 } },
          { $limit: 6 },
          {
            $lookup: {
              from: 'users',
              localField: 'creator',
              foreignField: '_id',
              as: 'creatorDetails'
            }
          },
          { $unwind: '$creatorDetails' },
          {
            $project: {
              title: 1,
              views: 1,
              category: 1,
              thumbnailFileName: 1,
              videoFileName: 1,
              isLive: 1,
              'creatorDetails.name': 1,
              'creatorDetails.avatar': 1
            }
          }
        ]
      }
    }
  ]);
};

// Alias for backward compatibility
videoSchema.statics.getCategoryStats = function () {
  return this.getCategoryAnalytics();
};

// Post Mongoose Hook on findOneAndDelete to cascade file cleanup & comment deletion
videoSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    try {
      // 1. Cascade delete associated comments
      await Comment.deleteMany({ video: doc._id });

      // 2. Remove video file from disk
      if (doc.videoFileName) {
        const videoFilePath = path.join(__dirname, '../../uploads/videos', doc.videoFileName);
        if (fs.existsSync(videoFilePath)) {
          fs.unlinkSync(videoFilePath);
          logger.info(`Unlinked video file: ${doc.videoFileName}`);
        }
      }

      // 3. Remove thumbnail file from disk
      if (doc.thumbnailFileName) {
        const thumbFilePath = path.join(__dirname, '../../uploads/thumbnails', doc.thumbnailFileName);
        if (fs.existsSync(thumbFilePath)) {
          fs.unlinkSync(thumbFilePath);
          logger.info(`Unlinked thumbnail file: ${doc.thumbnailFileName}`);
        }
      }
    } catch (err) {
      logger.error('Error during video deletion cleanup hook', { error: err.message });
    }
  }
});

export const Video = mongoose.model('Video', videoSchema);
