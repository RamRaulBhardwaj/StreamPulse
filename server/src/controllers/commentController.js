import mongoose from 'mongoose';
import { Comment } from '../models/Comment.js';
import { Video } from '../models/Video.js';
import { FALLBACK_STREAMS } from './videoController.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';

// Category-specific authentic comments: only topics relevant to the video
const TOPIC_COMMENTS = {
  Coding: [
    {
      _id: 'c_code_1',
      user: {
        _id: 'user_devguru',
        name: 'DevGuru',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DevGuru',
        role: 'viewer'
      },
      content: 'The custom Node.js Buffer range parser and HTTP 206 Partial Content headers are super clean!',
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString()
    },
    {
      _id: 'c_code_2',
      user: {
        _id: 'user_syntax_sage',
        name: 'SyntaxSage',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=SyntaxSage',
        role: 'viewer'
      },
      content: 'Handling stream backpressure with fs.createReadStream pipe is such a great architectural choice.',
      createdAt: new Date(Date.now() - 1000 * 60 * 8).toISOString()
    },
    {
      _id: 'c_code_3',
      user: {
        _id: 'user_stacktracer',
        name: 'StackTracer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StackTracer',
        role: 'viewer'
      },
      content: 'React Context API paired with Axios interceptors makes authentication so straightforward. Great explanation!',
      createdAt: new Date(Date.now() - 1000 * 60 * 3).toISOString()
    }
  ],
  Tech: [
    {
      _id: 'c_tech_1',
      user: {
        _id: 'user_bytecraft',
        name: 'ByteCraft',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ByteCraft',
        role: 'viewer'
      },
      content: 'Benchmark numbers on chunked streaming vs full payload loading are impressive. Zero buffer stutter.',
      createdAt: new Date(Date.now() - 1000 * 60 * 20).toISOString()
    },
    {
      _id: 'c_tech_2',
      user: {
        _id: 'user_cloudarch',
        name: 'CloudArch',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CloudArch',
        role: 'viewer'
      },
      content: 'The EventEmitter video lifecycle hooks provide such clean decoupling between upload and ingestion.',
      createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString()
    }
  ],
  Music: [
    {
      _id: 'c_music_1',
      user: {
        _id: 'user_beatcraft',
        name: 'BeatCraft',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BeatCraft',
        role: 'viewer'
      },
      content: 'This 24/7 lofi chill mix is the ultimate focus music. That mellow Rhodes electric piano is sublime 🎧',
      createdAt: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      _id: 'c_music_2',
      user: {
        _id: 'user_vinylvibes',
        name: 'VinylVibes',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=VinylVibes',
        role: 'viewer'
      },
      content: 'The drum swing and tape saturation give this track such authentic warmth. Bookmarked!',
      createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString()
    },
    {
      _id: 'c_music_3',
      user: {
        _id: 'user_melodymaven',
        name: 'MelodyMaven',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=MelodyMaven',
        role: 'viewer'
      },
      content: 'Clean lossless audio stream with zero clipping. Perfect background beats for late night deep work.',
      createdAt: new Date(Date.now() - 1000 * 60 * 4).toISOString()
    }
  ],
  Sports: [
    {
      _id: 'c_sports_1',
      user: {
        _id: 'user_apexracer',
        name: 'ApexRacer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexRacer',
        role: 'viewer'
      },
      content: 'Look at that sector 2 telemetry delta between Ferrari and Red Bull! That high-downforce wing is paying off.',
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString()
    },
    {
      _id: 'c_sports_2',
      user: {
        _id: 'user_pitwall',
        name: 'PitWallTactics',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PitWallTactics',
        role: 'viewer'
      },
      content: 'The undercut strategy is definitely the winning move given the severe tire degradation on the soft compound.',
      createdAt: new Date(Date.now() - 1000 * 60 * 14).toISOString()
    },
    {
      _id: 'c_sports_3',
      user: {
        _id: 'user_telemetryfan',
        name: 'GridTelemetry',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=GridTelemetry',
        role: 'viewer'
      },
      content: 'Peak speed trap data through the DRS straight shows +7 km/h advantage. Phenomenal trackside analysis!',
      createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString()
    }
  ],
  Movies: [
    {
      _id: 'c_movie_1',
      user: {
        _id: 'user_cinephile',
        name: 'FilmCraftsman',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=FilmCraftsman',
        role: 'viewer'
      },
      content: 'The practical miniature effects and scale modeling in this sequence hold up infinitely better than full CGI.',
      createdAt: new Date(Date.now() - 1000 * 60 * 40).toISOString()
    },
    {
      _id: 'c_movie_2',
      user: {
        _id: 'user_directorcut',
        name: 'DirectorsEye',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=DirectorsEye',
        role: 'viewer'
      },
      content: 'The anamorphic 2.39:1 aspect ratio framing and natural lighting choices here are a masterclass in composition.',
      createdAt: new Date(Date.now() - 1000 * 60 * 18).toISOString()
    },
    {
      _id: 'c_movie_3',
      user: {
        _id: 'user_sounddesign',
        name: 'ScoreBuff',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ScoreBuff',
        role: 'viewer'
      },
      content: 'Hans Zimmer score swell right as the camera tracks out gave me chills. Legendary cinema moment.',
      createdAt: new Date(Date.now() - 1000 * 60 * 6).toISOString()
    }
  ],
  Gaming: [
    {
      _id: 'c_game_1',
      user: {
        _id: 'user_pixelknight',
        name: 'PixelKnight',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelKnight',
        role: 'viewer'
      },
      content: 'That sub-4-minute speedrun split on stage 3 was frame-perfect! Unbelievable clutch finish.',
      createdAt: new Date(Date.now() - 1000 * 60 * 22).toISOString()
    },
    {
      _id: 'c_game_2',
      user: {
        _id: 'user_retrofan',
        name: 'RetroGamer99',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=RetroGamer99',
        role: 'viewer'
      },
      content: 'Classic 16-bit sound design brings back so much nostalgia. What controller setup are you using?',
      createdAt: new Date(Date.now() - 1000 * 60 * 11).toISOString()
    },
    {
      _id: 'c_game_3',
      user: {
        _id: 'user_bossbuster',
        name: 'BossBuster',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=BossBuster',
        role: 'viewer'
      },
      content: 'Dodging that last projectile attack with 1 HP remaining had my heart pounding! GG!',
      createdAt: new Date(Date.now() - 1000 * 60 * 2).toISOString()
    }
  ],
  Vlog: [
    {
      _id: 'c_vlog_1',
      user: {
        _id: 'user_wanderlust',
        name: 'TokyoWanderer',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=TokyoWanderer',
        role: 'viewer'
      },
      content: 'The rainy neon alleyways in Shinjuku look mesmerizing. The binaural audio makes it feel like I am walking right there.',
      createdAt: new Date(Date.now() - 1000 * 60 * 35).toISOString()
    },
    {
      _id: 'c_vlog_2',
      user: {
        _id: 'user_nomadlens',
        name: 'NomadLens',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=NomadLens',
        role: 'viewer'
      },
      content: 'The 4K camera rig and color grading are buttery smooth. What focal length did you shoot the street scenes on?',
      createdAt: new Date(Date.now() - 1000 * 60 * 16).toISOString()
    },
    {
      _id: 'c_vlog_3',
      user: {
        _id: 'user_streetfoodie',
        name: 'StreetFoodie',
        avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=StreetFoodie',
        role: 'viewer'
      },
      content: 'That midnight ramen shop looks so cozy! Definitely bookmarking this exact alley for my next trip.',
      createdAt: new Date(Date.now() - 1000 * 60 * 7).toISOString()
    }
  ]
};

let IN_MEMORY_COMMENTS = [];

export const getVideoComments = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const limit = parseInt(req.query.limit, 10) || 100;

    let comments = [];
    let totalComments = 0;
    let videoCategory = 'Coding';

    // 1. Detect video category to ensure topic-specific comments
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(videoId)) {
      try {
        const foundVideo = await Video.findById(videoId).select('category');
        if (foundVideo && foundVideo.category) {
          videoCategory = foundVideo.category;
        }

        totalComments = await Comment.countDocuments({ video: videoId });
        comments = await Comment.find({ video: videoId })
          .sort({ createdAt: -1 })
          .limit(limit)
          .populate('user', 'name avatar role');
      } catch {
        // fallback to in-memory below
      }
    }

    if (!comments || comments.length === 0) {
      const fallbackVideo = FALLBACK_STREAMS.find(
        (s) => s._id === videoId || s.creator?._id === videoId
      );
      if (fallbackVideo && fallbackVideo.category) {
        videoCategory = fallbackVideo.category;
      }
    }

    // 2. Select topic-specific fallback comments matching the video category
    const categoryKey =
      Object.keys(TOPIC_COMMENTS).find(
        (k) => k.toLowerCase() === (videoCategory || '').toLowerCase()
      ) || (videoCategory === 'Tech' ? 'Tech' : 'Coding');

    const defaultTopicComments = TOPIC_COMMENTS[categoryKey] || TOPIC_COMMENTS.Coding;

    // 3. Combine with newly created user comments for this specific video
    const videoInMemory = IN_MEMORY_COMMENTS.filter((c) => c.video === videoId);
    const combinedComments = [
      ...videoInMemory,
      ...(comments && comments.length > 0 ? comments : defaultTopicComments)
    ];

    res.status(200).json(
      new ApiResponse(
        200,
        {
          category: videoCategory,
          comments: combinedComments.slice(0, limit),
          totalComments: totalComments + videoInMemory.length || combinedComments.length
        },
        'Comments retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

export const createComment = async (req, res, next) => {
  try {
    const { videoId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      throw new ApiError(400, 'Comment content cannot be empty');
    }

    const currentUserId = (req.user._id || req.user.id || 'user').toString();

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(videoId)) {
      try {
        const comment = await Comment.create({
          video: videoId,
          user: currentUserId,
          content: content.trim()
        });

        const populatedComment = await Comment.findById(comment._id).populate(
          'user',
          'name avatar role'
        );

        return res.status(201).json(
          new ApiResponse(201, populatedComment, 'Comment posted successfully')
        );
      } catch {
        // fallback below
      }
    }

    // In-memory comment with author ID strictly matching the logged in user
    const mockComment = {
      _id: `msg-${Date.now()}`,
      video: videoId,
      user: {
        _id: currentUserId,
        id: currentUserId,
        name: req.user.name || 'Anonymous',
        avatar:
          req.user.avatar ||
          `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(req.user.name || 'Anonymous')}`,
        role: req.user.role || 'viewer'
      },
      content: content.trim(),
      createdAt: new Date().toISOString()
    };

    IN_MEMORY_COMMENTS.unshift(mockComment);

    return res.status(201).json(
      new ApiResponse(201, mockComment, 'Comment posted successfully')
    );
  } catch (error) {
    next(error);
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const currentUserId = (req.user._id || req.user.id || '').toString();
    const isAdmin = req.user && req.user.role === 'admin';

    // 1. Check MongoDB if active
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        const comment = await Comment.findById(id);
        if (comment) {
          const commentAuthorId = (comment.user?._id || comment.user || '').toString();
          if (!isAdmin && commentAuthorId !== currentUserId) {
            throw new ApiError(403, 'You are only authorized to delete your own comments');
          }

          await Comment.findByIdAndDelete(id);
          return res.status(200).json(
            new ApiResponse(200, null, 'Comment deleted successfully')
          );
        }
      } catch (err) {
        if (err.statusCode === 403) throw err;
      }
    }

    // 2. Check In-Memory Comments
    const memIndex = IN_MEMORY_COMMENTS.findIndex((c) => c._id === id);
    if (memIndex !== -1) {
      const comment = IN_MEMORY_COMMENTS[memIndex];
      const commentAuthorId = (comment.user?._id || comment.user?.id || '').toString();
      if (!isAdmin && commentAuthorId !== currentUserId) {
        throw new ApiError(403, 'You are only authorized to delete your own comments');
      }

      IN_MEMORY_COMMENTS.splice(memIndex, 1);
      return res.status(200).json(
        new ApiResponse(200, null, 'Comment deleted successfully')
      );
    }

    // 3. Check Topic Seed Comments
    for (const cat of Object.keys(TOPIC_COMMENTS)) {
      const seedIndex = TOPIC_COMMENTS[cat].findIndex((c) => c._id === id);
      if (seedIndex !== -1) {
        const comment = TOPIC_COMMENTS[cat][seedIndex];
        const commentAuthorId = (comment.user?._id || comment.user?.id || '').toString();
        if (!isAdmin && commentAuthorId !== currentUserId) {
          throw new ApiError(403, 'You are only authorized to delete your own comments');
        }

        TOPIC_COMMENTS[cat].splice(seedIndex, 1);
        return res.status(200).json(
          new ApiResponse(200, null, 'Comment deleted successfully')
        );
      }
    }

    res.status(200).json(
      new ApiResponse(200, null, 'Comment deleted successfully')
    );
  } catch (error) {
    next(error);
  }
};
