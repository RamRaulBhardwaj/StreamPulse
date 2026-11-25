import dotenv from 'dotenv';
dotenv.config();

import mongoose from 'mongoose';
import { User } from '../models/User.js';
import { Video } from '../models/Video.js';
import { Comment } from '../models/Comment.js';
import { logger } from '../config/logger.js';
import { FALLBACK_STREAMS } from '../controllers/videoController.js';

export const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/bee_video_streaming';
    await mongoose.connect(mongoUri);
    logger.info('Connected to MongoDB for data seeding...');

    // Clear existing data
    await User.deleteMany();
    await Video.deleteMany();
    await Comment.deleteMany();
    logger.info('Cleared existing collections.');

    // 1. Create Seed Creators & Users
    const creator1 = await User.create({
      name: 'CodeValkyrie',
      email: 'creator@example.com',
      password: 'password123',
      role: 'creator',
      bio: 'Full-time JavaScript & Node.js streamer.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeValkyrie'
    });

    const creator2 = await User.create({
      name: 'PixelRanger',
      email: 'pixel@example.com',
      password: 'password123',
      role: 'creator',
      bio: 'Retro gaming & speedruns.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelRanger'
    });

    const creator3 = await User.create({
      name: 'LofiChillers',
      email: 'lofi@example.com',
      password: 'password123',
      role: 'creator',
      bio: '24/7 relaxing lofi beats to study / code to.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LofiChillers'
    });

    const creator4 = await User.create({
      name: 'AlexVlogs',
      email: 'alex@example.com',
      password: 'password123',
      role: 'creator',
      bio: 'Travel, minimalist desk setups, and daily life.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVlogs'
    });

    const creator5 = await User.create({
      name: 'ApexSports',
      email: 'sports@example.com',
      password: 'password123',
      role: 'creator',
      bio: 'Formula 1 telemetry, football tactical breakdowns, and sports highlights.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexSports'
    });

    const creator6 = await User.create({
      name: 'CinemaScope',
      email: 'cinema@example.com',
      password: 'password123',
      role: 'creator',
      bio: 'Cinematography breakdowns and deep film analysis.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CinemaScope'
    });

    const viewer = await User.create({
      name: 'JohnDoe',
      email: 'viewer@example.com',
      password: 'password123',
      role: 'viewer',
      bio: 'Video streaming enthusiast.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=JohnDoe'
    });

    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
      bio: 'Platform administration.',
      avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=Admin'
    });

    // Creator map by name
    const creatorMap = {
      CodeValkyrie: creator1._id,
      PixelRanger: creator2._id,
      LofiChillers: creator3._id,
      AlexVlogs: creator4._id,
      ApexSports: creator5._id,
      CinemaScope: creator6._id
    };

    // 2. Insert all 25 Videos (5 Live + 20 Normal across Vlog, Sports, Movies, Tech, Music)
    const videosToInsert = FALLBACK_STREAMS.map((s) => ({
      title: s.title,
      description: s.description,
      videoFileName: s.videoFileName,
      thumbnailFileName: s.thumbnailFileName || '',
      mimeType: 'video/mp4',
      size: s.size,
      views: s.views,
      isLive: s.isLive,
      duration: s.duration || '12:30',
      category: s.category,
      tags: s.tags,
      likes: [viewer._id],
      creator: creatorMap[s.creator.name] || creator1._id
    }));

    const insertedVideos = await Video.insertMany(videosToInsert);
    logger.info(`Inserted ${insertedVideos.length} videos (5 live + 20 normal-length).`);

    // 3. Create sample comments
    const commentsToInsert = [
      {
        video: insertedVideos[0]._id,
        user: viewer._id,
        content: 'The telemetry analysis on tire degradation was spot on!'
      },
      {
        video: insertedVideos[0]._id,
        user: admin._id,
        content: 'Excellent broadcast quality. Zero frame drops.'
      },
      {
        video: insertedVideos[1]._id,
        user: viewer._id,
        content: 'The HTTP 206 Partial Content byte range explanation was crystal clear!'
      },
      {
        video: insertedVideos[5]._id,
        user: viewer._id,
        content: 'Kyoto looks breathtaking in autumn. Great cinematography!'
      },
      {
        video: insertedVideos[12]._id,
        user: viewer._id,
        content: 'Best explanation of Node.js stream backpressure and buffers.'
      }
    ];

    await Comment.insertMany(commentsToInsert);
    logger.info(`Inserted ${commentsToInsert.length} comments.`);
    logger.info('==================================================');
    logger.info('  DATABASE SEEDING COMPLETED SUCCESSFULLY!        ');
    logger.info('==================================================');
  } catch (error) {
    logger.error('Error during seeding', { error: error.message, stack: error.stack });
    throw error;
  }
};

if (process.argv[1] && (process.argv[1].endsWith('seeder.js') || process.argv[1].endsWith('seed.js'))) {
  seedData()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}
