import mongoose from 'mongoose';

const commentSchema = new mongoose.Schema(
  {
    video: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Video',
      required: [true, 'Comment must belong to a video/stream'],
      index: true
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Comment must have an author']
    },
    content: {
      type: String,
      required: [true, 'Chat message cannot be empty'],
      trim: true,
      minlength: [1, 'Chat message must have at least 1 character'],
      maxlength: [500, 'Chat message cannot exceed 500 characters']
    }
  },
  {
    timestamps: true
  }
);

// Compound Index: Video and CreatedAt ascending for real-time chat ordering
commentSchema.index({ video: 1, createdAt: 1 });

export const Comment = mongoose.model('Comment', commentSchema);
