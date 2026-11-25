import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import mongoose from 'mongoose';
import { Video } from '../models/Video.js';
import { ApiError } from '../utils/apiError.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { videoEventEmitter } from '../events/videoEvents.js';
import { logger } from '../config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const videoStorageDir = path.join(__dirname, '../../uploads/videos');

// Demo Creators for Seeding & Offline Fallback
const CREATORS = [
  { _id: '6650fae94d8f1b2039c01001', name: 'CodeValkyrie', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CodeValkyrie', role: 'creator' },
  { _id: '6650fae94d8f1b2039c01002', name: 'PixelRanger', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=PixelRanger', role: 'creator' },
  { _id: '6650fae94d8f1b2039c01003', name: 'LofiChillers', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=LofiChillers', role: 'creator' },
  { _id: '6650fae94d8f1b2039c01004', name: 'AlexVlogs', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=AlexVlogs', role: 'creator' },
  { _id: '6650fae94d8f1b2039c01005', name: 'ApexSports', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=ApexSports', role: 'creator' },
  { _id: '6650fae94d8f1b2039c01006', name: 'CinemaScope', avatar: 'https://api.dicebear.com/7.x/bottts/svg?seed=CinemaScope', role: 'creator' }
];

export const FALLBACK_STREAMS = [
  // --- 5 LIVE STREAMS FOR TOP CAROUSEL ---
  {
    _id: '6650fae94d8f1b2039c01101',
    title: '🔴 [LIVE] Formula 1 Grand Prix Weekend Trackside Analysis & Telemetry',
    description: 'Live qualifying telemetry breakdown, tire strategy projections, and driver radio review straight from the paddock.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'live-1.png',
    size: 788493,
    views: 58200,
    isLive: true,
    duration: 'LIVE',
    category: 'Sports',
    tags: ['f1', 'racing', 'telemetry', 'grandprix'],
    likes: [],
    creator: CREATORS[4],
    createdAt: new Date().toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01102',
    title: '🔴 [LIVE] Building Twitch From Scratch with Node.js HTTP 206 Streaming & React!',
    description: 'Deep dive into pure JavaScript video streaming architecture! Writing custom Buffer range parser, EventEmitter lifecycle hooks, and responsive dark-mode UI with Tailwind CSS. Ask questions in live chat!',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'live-2.png',
    size: 788493,
    views: 32400,
    isLive: true,
    duration: 'LIVE',
    category: 'Tech',
    tags: ['nodejs', 'streams', 'http206', 'javascript', 'react'],
    likes: [],
    creator: CREATORS[0],
    createdAt: new Date(Date.now() - 1800000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01103',
    title: '🔴 [LIVE] Tokyo Midnight Street Food & Rainy Alleyway Walking Tour (4K HDR)',
    description: 'Wandering through the neon alleyways of Shinjuku and Omoide Yokocho in the midnight rain with binaural audio.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'live-3.png',
    size: 788493,
    views: 76100,
    isLive: true,
    duration: 'LIVE',
    category: 'Vlog',
    tags: ['tokyo', 'travel', 'streetfood', 'rain'],
    likes: [],
    creator: CREATORS[3],
    createdAt: new Date(Date.now() - 3600000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01104',
    title: '🔴 [LIVE] Acoustic Sunset Chill & Songwriting Live Session',
    description: 'Relaxing fingerstyle acoustic guitar improvisations and real-time songwriting breakdown with audience chat.',
    videoFileName: 'sample-music.mp4',
    thumbnailFileName: 'live-4.png',
    size: 788493,
    views: 41800,
    isLive: true,
    duration: 'LIVE',
    category: 'Music',
    tags: ['acoustic', 'guitar', 'chill', 'livemusic'],
    likes: [],
    creator: CREATORS[2],
    createdAt: new Date(Date.now() - 5400000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01105',
    title: '🔴 [LIVE] Classic Sci-Fi Cinema Watch-Along & Director Commentary Review',
    description: 'Scene-by-scene analysis of groundbreaking practical effects, model work, and camera rigs in 80s sci-fi cinema.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'live-5.png',
    size: 788493,
    views: 29500,
    isLive: true,
    duration: 'LIVE',
    category: 'Movies',
    tags: ['cinema', 'scifi', 'filmmaking', 'review'],
    likes: [],
    creator: CREATORS[5],
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },

  // --- 20 NORMAL-LENGTH VIDEOS (4 ROWS × 4-5 ITEMS) ---
  // Vlog (4 videos)
  {
    _id: '6650fae94d8f1b2039c01201',
    title: 'A Day in My Life as a Remote Software Architect in Kyoto',
    description: 'Morning matcha, cycling through quiet temples, architecture planning, and debugging distributed services.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'video-1.jpg',
    size: 788493,
    views: 84300,
    likesCount: 7900,
    isLive: false,
    duration: '14:28',
    category: 'Vlog',
    tags: ['vlog', 'kyoto', 'remotework', 'lifestyle'],
    likes: [],
    creator: CREATORS[3],
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01202',
    title: 'Epic 7-Day Solo Camping & Hiking Across the Swiss Alps',
    description: 'High-altitude trails, freezing nights under the Milky Way, and cooking wild mountain meals.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'video-2.jpg',
    size: 788493,
    views: 120500,
    likesCount: 16400,
    isLive: false,
    duration: '22:15',
    category: 'Vlog',
    tags: ['camping', 'alps', 'hiking', 'adventure'],
    likes: [],
    creator: CREATORS[3],
    createdAt: new Date(Date.now() - 90000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01203',
    title: 'Building My Minimalist Dream Desk Setup & Invisible Cable Management',
    description: 'Custom solid walnut butcher block, motorized standing frame, wireless charging inlays, and zero dangling cords.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-3.jpg',
    size: 788493,
    views: 65200,
    likesCount: 9200,
    isLive: false,
    duration: '11:42',
    category: 'Vlog',
    tags: ['desksetup', 'minimalism', 'workspace', 'tech'],
    likes: [],
    creator: CREATORS[0],
    createdAt: new Date(Date.now() - 95000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01204',
    title: 'Street Photography Masterclass: Capturing Reflections & Neon in Rain',
    description: 'Camera settings, 35mm prime lens techniques, and composition secrets for wet night cities.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'video-4.jpg',
    size: 788493,
    views: 48900,
    likesCount: 3900,
    isLive: false,
    duration: '16:04',
    category: 'Vlog',
    tags: ['photography', 'art', 'tutorial', 'creative'],
    likes: [],
    creator: CREATORS[3],
    createdAt: new Date(Date.now() - 100000000).toISOString()
  },

  // Sports (4 videos)
  {
    _id: '6650fae94d8f1b2039c01205',
    title: 'Top 10 Unbelievable Comebacks in European Championship History',
    description: 'From 3 goals down in stoppage time to legendary bicycle kicks — the greatest sports drama ever recorded.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'video-5.jpg',
    size: 788493,
    views: 245000,
    likesCount: 28900,
    isLive: false,
    duration: '18:50',
    category: 'Sports',
    tags: ['football', 'sports', 'comebacks', 'champions'],
    likes: [],
    creator: CREATORS[4],
    createdAt: new Date(Date.now() - 110000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01206',
    title: 'Inside NBA Training Camp: Athletic Agility & Vertical Jump Science',
    description: 'Biomechanics analysis, plyometric drills, and explosive power regimens used by pro all-stars.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'video-6.jpg',
    size: 788493,
    views: 98400,
    likesCount: 11500,
    isLive: false,
    duration: '13:35',
    category: 'Sports',
    tags: ['nba', 'basketball', 'training', 'fitness'],
    likes: [],
    creator: CREATORS[4],
    createdAt: new Date(Date.now() - 115000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01207',
    title: 'Extreme Downhill Mountain Biking Through Red Rock Utah Canyons (4K)',
    description: 'Razor-thin cliff edges, massive gap jumps, and extreme downhill speed with helmet POV camera.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'video-7.jpg',
    size: 788493,
    views: 178000,
    likesCount: 22400,
    isLive: false,
    duration: '09:48',
    category: 'Sports',
    tags: ['mtb', 'downhill', 'extreme', 'redbull'],
    likes: [],
    creator: CREATORS[1],
    createdAt: new Date(Date.now() - 120000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01208',
    title: 'Tactical Breakdown: How Modern High-Pressing Football Works',
    description: 'Counter-pressing triggers, spatial overloads, and tactical defensive transitions mapped on pitch software.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'video-8.jpg',
    size: 788493,
    views: 54100,
    likesCount: 6100,
    isLive: false,
    duration: '15:20',
    category: 'Sports',
    tags: ['tactics', 'soccer', 'analysis', 'coaching'],
    likes: [],
    creator: CREATORS[4],
    createdAt: new Date(Date.now() - 125000000).toISOString()
  },

  // Movies (4 videos)
  {
    _id: '6650fae94d8f1b2039c01209',
    title: 'How Denis Villeneuve Perfected Visual Storytelling in Modern Sci-Fi',
    description: 'Brutalist architecture, color psychology, and silent scale in Dune, Blade Runner 2049, and Arrival.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-9.jpg',
    size: 788493,
    views: 189000,
    likesCount: 24500,
    isLive: false,
    duration: '21:10',
    category: 'Movies',
    tags: ['dune', 'villeneuve', 'film', 'analysis'],
    likes: [],
    creator: CREATORS[5],
    createdAt: new Date(Date.now() - 130000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01210',
    title: 'The Hidden Practical Effects Behind Interstellar’s Gargantua Black Hole',
    description: 'Gravitational lensing physics, IMAX miniature models, and Christopher Nolan’s zero-CGI philosophy.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-10.jpg',
    size: 788493,
    views: 310000,
    likesCount: 35200,
    isLive: false,
    duration: '17:45',
    category: 'Movies',
    tags: ['interstellar', 'nolan', 'effects', 'science'],
    likes: [],
    creator: CREATORS[5],
    createdAt: new Date(Date.now() - 135000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01211',
    title: 'Cinematography Breakdown: Natural Window Lighting vs Studio ARRI Rigs',
    description: 'Matching practical source lights with high-CRI LEDs to create organic cinematic textures on digital sensors.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'video-11.jpg',
    size: 788493,
    views: 72400,
    likesCount: 8800,
    isLive: false,
    duration: '12:55',
    category: 'Movies',
    tags: ['cinematography', 'lighting', 'camera', 'filmmaking'],
    likes: [],
    creator: CREATORS[5],
    createdAt: new Date(Date.now() - 140000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01212',
    title: '10 Film Plot Twists That Actually Reward Second Viewings',
    description: 'Meticulous background foreshadowing, audio cues, and hidden clues you only notice on a re-watch.',
    videoFileName: 'sample-gaming.mp4',
    thumbnailFileName: 'video-12.jpg',
    size: 788493,
    views: 145000,
    likesCount: 18300,
    isLive: false,
    duration: '19:30',
    category: 'Movies',
    tags: ['movies', 'cinema', 'plottwist', 'writing'],
    likes: [],
    creator: CREATORS[5],
    createdAt: new Date(Date.now() - 145000000).toISOString()
  },

  // Tech (4 videos)
  {
    _id: '6650fae94d8f1b2039c01213',
    title: 'Mastering Node.js HTTP 206 Streaming & Buffer Slices Explained',
    description: 'In-depth tutorial on how video streaming protocols work under the hood using native fs.createReadStream and Range headers.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-13.jpg',
    size: 788493,
    views: 92000,
    likesCount: 48900,
    isLive: false,
    duration: '28:14',
    category: 'Tech',
    tags: ['nodejs', 'streaming', 'javascript', 'backend'],
    likes: [],
    creator: CREATORS[0],
    createdAt: new Date(Date.now() - 150000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01214',
    title: 'Building Modern Micro-Frontends Without Framework Lock-in',
    description: 'Module federation, iframe sandboxes, and custom event buses for enterprise multi-team frontend web apps.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-14.jpg',
    size: 788493,
    views: 43200,
    likesCount: 5300,
    isLive: false,
    duration: '20:05',
    category: 'Tech',
    tags: ['microfrontend', 'architecture', 'webdev', 'frontend'],
    likes: [],
    creator: CREATORS[0],
    createdAt: new Date(Date.now() - 155000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01215',
    title: 'Why Mechanical Keyboards Sound Different: Plate & Switch Deep Dive',
    description: 'FR4 vs Brass vs Polycarbonate plates, lubing linear switches, and gasket mounting acoustical analysis.',
    videoFileName: 'sample-education.mp4',
    thumbnailFileName: 'video-15.jpg',
    size: 788493,
    views: 112000,
    likesCount: 19100,
    isLive: false,
    duration: '14:52',
    category: 'Tech',
    tags: ['keyboards', 'hardware', 'audio', 'mechanical'],
    likes: [],
    creator: CREATORS[1],
    createdAt: new Date(Date.now() - 160000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01216',
    title: 'Demystifying Event Loop, Microtasks & Async Callbacks in V8 Engine',
    description: 'Watch the call stack, macrotask queue, microtask queue, and render pipeline execute frame by frame.',
    videoFileName: 'sample-tech.mp4',
    thumbnailFileName: 'video-16.jpg',
    size: 788493,
    views: 88700,
    likesCount: 15400,
    isLive: false,
    duration: '25:40',
    category: 'Tech',
    tags: ['eventloop', 'v8', 'javascript', 'engine'],
    likes: [],
    creator: CREATORS[0],
    createdAt: new Date(Date.now() - 165000000).toISOString()
  },

  // Music (4 videos)
  {
    _id: '6650fae94d8f1b2039c01217',
    title: 'Lofi Hip Hop Study Mix — 1 Hour of Deep Focus Chill Beats',
    description: 'Uninterrupted smooth instrumental jazz chords, mellow drums, and vinyl warmth for deep coding sessions.',
    videoFileName: 'sample-music.mp4',
    thumbnailFileName: 'video-17.jpg',
    size: 788493,
    views: 420000,
    likesCount: 42100,
    isLive: false,
    duration: '45:00',
    category: 'Music',
    tags: ['lofi', 'beats', 'study', 'focus'],
    likes: [],
    creator: CREATORS[2],
    createdAt: new Date(Date.now() - 170000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01218',
    title: 'Synthesizer Anatomy: Building Vintage 80s Synthwave Basslines',
    description: 'Juno chorus emulation, low-pass filter envelopes, and sidechain compression in analogue synthesizers.',
    videoFileName: 'sample-music.mp4',
    thumbnailFileName: 'video-18.jpg',
    size: 788493,
    views: 67500,
    likesCount: 9400,
    isLive: false,
    duration: '16:22',
    category: 'Music',
    tags: ['synth', 'synthwave', 'production', 'retro'],
    likes: [],
    creator: CREATORS[2],
    createdAt: new Date(Date.now() - 175000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01219',
    title: 'Fingerstyle Guitar Arrangements of Iconic Anime Soundtracks',
    description: 'Solo acoustic guitar covers with tab notation, percussive tapping, and custom open tunings.',
    videoFileName: 'sample-music.mp4',
    thumbnailFileName: 'video-19.jpg',
    size: 788493,
    views: 134000,
    likesCount: 52400,
    isLive: false,
    duration: '10:18',
    category: 'Music',
    tags: ['guitar', 'fingerstyle', 'anime', 'acoustic'],
    likes: [],
    creator: CREATORS[2],
    createdAt: new Date(Date.now() - 180000000).toISOString()
  },
  {
    _id: '6650fae94d8f1b2039c01220',
    title: 'Music Production Workflow: Mixing Vocals from Scratch to Master',
    description: 'EQ carving, dynamic de-essing, pitch correction, parallel saturation, and spatial reverb sends.',
    videoFileName: 'sample-music.mp4',
    thumbnailFileName: 'video-20.jpg',
    size: 788493,
    views: 86300,
    likesCount: 12200,
    isLive: false,
    duration: '31:45',
    category: 'Music',
    tags: ['mixing', 'audio', 'production', 'mastering'],
    likes: [],
    creator: CREATORS[2],
    createdAt: new Date(Date.now() - 185000000).toISOString()
  }
];

/**
 * HTTP 206 Partial Content Video Streaming Engine (Units 1, 2, 4)
 * Streams uploaded .mp4 in chunks using Node.js fs streams, Buffers, and Range headers
 * GET /api/videos/stream/:id & GET /api/videos/:id/stream
 */
export const streamVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    let video = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        video = await Video.findById(id);
      } catch {
        // Fallback below
      }
    }

    if (!video) {
      video = FALLBACK_STREAMS.find((s) => s._id === id || s.videoFileName === id);
    }

    let videoPath;
    let mimeType = 'video/mp4';

    if (video) {
      videoPath = path.join(videoStorageDir, video.videoFileName);
      mimeType = video.mimeType || 'video/mp4';
    } else {
      const directCandidate = path.join(videoStorageDir, id.endsWith('.mp4') ? id : `${id}.mp4`);
      if (fs.existsSync(directCandidate)) {
        videoPath = directCandidate;
      } else {
        const defaultSample = path.join(videoStorageDir, 'sample-tech.mp4');
        if (fs.existsSync(defaultSample)) {
          videoPath = defaultSample;
        } else {
          throw new ApiError(404, 'Video stream file not found');
        }
      }
    }

    if (!fs.existsSync(videoPath)) {
      throw new ApiError(404, 'Video file does not exist on storage');
    }

    const stat = fs.statSync(videoPath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (!range) {
      const head = {
        'Content-Length': fileSize,
        'Content-Type': mimeType,
        'Accept-Ranges': 'bytes'
      };
      res.writeHead(200, head);
      return fs.createReadStream(videoPath).pipe(res);
    }

    const parts = range.replace(/bytes=/, '').split('-');
    const start = parseInt(parts[0], 10);
    const CHUNK_SIZE = 2 * 1024 * 1024; // 2MB Chunk Buffer
    const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);

    if (start >= fileSize || end >= fileSize || start > end) {
      res.setHeader('Content-Range', `bytes */${fileSize}`);
      return res.status(416).send('Requested range not satisfiable');
    }

    const contentLength = end - start + 1;

    const headers = {
      'Content-Range': `bytes ${start}-${end}/${fileSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': mimeType
    };

    res.writeHead(206, headers);

    const videoStream = fs.createReadStream(videoPath, { start, end });

    videoStream.on('error', (streamErr) => {
      logger.error('Error in video read stream', { error: streamErr.message, videoId: id });
      if (!res.headersSent) {
        res.status(500).send('Stream transmission error');
      }
    });

    req.on('close', () => {
      videoStream.destroy();
    });

    videoStream.pipe(res);

    videoEventEmitter.emit('video:streamed', {
      videoId: video ? video._id : id,
      range: { start, end, fileSize, chunkBytes: contentLength },
      ip: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Upload a new video with Multer
 * POST /api/videos
 */
export const createVideo = async (req, res, next) => {
  try {
    const { title, description, category, tags, duration, isLive } = req.body;

    if (!req.files || !req.files.video || req.files.video.length === 0) {
      throw new ApiError(400, 'Please upload a video file (.mp4)');
    }

    const videoFile = req.files.video[0];
    const thumbnailFile = req.files.thumbnail ? req.files.thumbnail[0] : null;

    let parsedTags = [];
    if (tags) {
      if (Array.isArray(tags)) {
        parsedTags = tags;
      } else if (typeof tags === 'string') {
        parsedTags = tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
      }
    }

    let video;
    if (mongoose.connection.readyState === 1) {
      video = await Video.create({
        title,
        description: description || '',
        videoFileName: videoFile.filename,
        thumbnailFileName: thumbnailFile ? thumbnailFile.filename : '',
        mimeType: videoFile.mimetype || 'video/mp4',
        size: videoFile.size,
        category,
        tags: parsedTags,
        duration: duration || '12:30',
        isLive: isLive === 'true' || isLive === true,
        creator: req.user._id
      });
    } else {
      const mockVideoId = `vid_${Date.now()}`;
      video = {
        _id: mockVideoId,
        id: mockVideoId,
        title,
        description: description || '',
        videoFileName: videoFile.filename,
        thumbnailFileName: thumbnailFile ? thumbnailFile.filename : '',
        mimeType: videoFile.mimetype || 'video/mp4',
        size: videoFile.size,
        category,
        tags: parsedTags,
        duration: duration || '12:30',
        isLive: isLive === 'true' || isLive === true,
        creator: req.user,
        views: 0,
        likes: [],
        likesCount: 0,
        createdAt: new Date().toISOString()
      };
      FALLBACK_STREAMS.unshift(video);
    }

    videoEventEmitter.emit('video:uploaded', {
      videoId: video._id || video.id,
      title: video.title,
      creatorId: req.user._id,
      size: video.size,
      category: video.category
    });

    res.status(201).json(
      new ApiResponse(201, video, 'Video uploaded successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * List videos with filtering, searching, and pagination
 * Defaults limit to 16 for 4 full rows (4x4)
 * GET /api/videos
 */
export const getVideos = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 16;
    const skip = (page - 1) * limit;

    const { search, category, creator, sort = 'views', isLive } = req.query;

    let totalVideos = 0;
    let videos = [];

    try {
      if (mongoose.connection.readyState !== 1) {
        throw new Error('Database disconnected, using in-memory demo fallback');
      }
      const query = {};
      if (category && category !== 'All') {
        query.category = category;
      }
      if (creator) {
        query.creator = creator;
      }
      if (isLive !== undefined && isLive !== '') {
        query.isLive = isLive === 'true';
      }
      if (search && search.trim()) {
        query.$text = { $search: search.trim() };
      }

      let sortOptions = { views: -1 };
      if (sort === 'newest') sortOptions = { createdAt: -1 };
      if (sort === 'oldest') sortOptions = { createdAt: 1 };
      if (sort === 'popular') sortOptions = { views: -1 };

      totalVideos = await Video.countDocuments(query);
      videos = await Video.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .populate('creator', 'name email avatar role');
    } catch {
      // Fallback in-memory streams
      let filtered = [...FALLBACK_STREAMS];
      if (isLive !== undefined && isLive !== '') {
        const liveBool = isLive === 'true';
        filtered = filtered.filter((v) => v.isLive === liveBool);
      }
      if (category && category !== 'All') {
        filtered = filtered.filter((v) => v.category === category);
      }
      if (search && search.trim()) {
        const s = search.trim().toLowerCase();
        filtered = filtered.filter(
          (v) =>
            v.title.toLowerCase().includes(s) ||
            v.category.toLowerCase().includes(s) ||
            v.tags.some((t) => t.includes(s))
        );
      }

      // Sort in-memory fallback streams according to requested sort option
      if (sort === 'popular') {
        // Sort by likesCount (popularity) descending, then views
        filtered.sort((a, b) => {
          const countA = a.likesCount !== undefined ? a.likesCount : (Array.isArray(a.likes) ? a.likes.length : 0);
          const countB = b.likesCount !== undefined ? b.likesCount : (Array.isArray(b.likes) ? b.likes.length : 0);
          if (countB !== countA) return countB - countA;
          return (b.views || 0) - (a.views || 0);
        });
      } else if (sort === 'newest') {
        // Sort by most recently created
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      } else if (sort === 'oldest') {
        // Sort by oldest created
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      } else {
        // Default ('views'): Sort by most viewed descending
        filtered.sort((a, b) => (b.views || 0) - (a.views || 0));
      }

      totalVideos = filtered.length;
      videos = filtered.slice(skip, skip + limit);
    }

    res.status(200).json(
      new ApiResponse(
        200,
        {
          videos,
          pagination: {
            currentPage: page,
            totalPages: Math.ceil(totalVideos / limit) || 1,
            totalVideos,
            limit
          }
        },
        'Videos retrieved successfully'
      )
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Get single video by ID (increments view count)
 * GET /api/videos/:id
 */
export const getVideoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    let video = null;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        video = await Video.findByIdAndUpdate(
          id,
          { $inc: { views: 1 } },
          { new: true }
        )
          .populate('creator', 'name email avatar role')
          .populate({
            path: 'comments',
            options: { sort: { createdAt: -1 } },
            populate: { path: 'user', select: 'name avatar role' }
          });
      } catch {
        // fallback below
      }
    }

    if (!video) {
      video = FALLBACK_STREAMS.find((s) => s._id === id || s.creator?._id === id) || FALLBACK_STREAMS[0];
    }

    if (!video) {
      throw new ApiError(404, 'Video not found');
    }

    res.status(200).json(
      new ApiResponse(200, video, 'Video details retrieved successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Update video metadata
 * PUT /api/videos/:id
 */
export const updateVideo = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { title, description, category, tags, duration, isLive } = req.body;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const video = await Video.findById(id);
      if (video) {
        if (
          video.creator.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin'
        ) {
          throw new ApiError(403, 'Not authorized to modify this video');
        }

        if (title !== undefined) video.title = title;
        if (description !== undefined) video.description = description;
        if (category !== undefined) video.category = category;
        if (duration !== undefined) video.duration = duration;
        if (isLive !== undefined) video.isLive = isLive;
        if (tags !== undefined) {
          video.tags = Array.isArray(tags)
            ? tags
            : tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
        }

        const updatedVideo = await video.save();

        return res.status(200).json(
          new ApiResponse(200, updatedVideo, 'Video updated successfully')
        );
      }
    }

    // In-memory fallback
    const fallbackVideo = FALLBACK_STREAMS.find((s) => s._id === id);
    if (!fallbackVideo) {
      throw new ApiError(404, 'Video not found');
    }

    if (title !== undefined) fallbackVideo.title = title;
    if (description !== undefined) fallbackVideo.description = description;
    if (category !== undefined) fallbackVideo.category = category;
    if (duration !== undefined) fallbackVideo.duration = duration;
    if (isLive !== undefined) fallbackVideo.isLive = isLive;
    if (tags !== undefined) {
      fallbackVideo.tags = Array.isArray(tags)
        ? tags
        : tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
    }

    return res.status(200).json(
      new ApiResponse(200, fallbackVideo, 'Video updated successfully')
    );
  } catch (error) {
    next(error);
  }
};

/**
 * Delete video
 * DELETE /api/videos/:id
 */
export const deleteVideo = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      const video = await Video.findById(id);
      if (video) {
        if (
          video.creator.toString() !== req.user._id.toString() &&
          req.user.role !== 'admin'
        ) {
          throw new ApiError(403, 'Not authorized to delete this video');
        }

        await Video.findOneAndDelete({ _id: id });

        videoEventEmitter.emit('video:deleted', {
          videoId: id,
          videoFileName: video.videoFileName,
          deletedBy: req.user._id
        });

        return res.status(200).json(
          new ApiResponse(200, null, 'Video deleted successfully')
        );
      }
    }

    // In-memory fallback
    const idx = FALLBACK_STREAMS.findIndex((s) => s._id === id);
    if (idx !== -1) {
      const delVideo = FALLBACK_STREAMS[idx];
      FALLBACK_STREAMS.splice(idx, 1);
      videoEventEmitter.emit('video:deleted', {
        videoId: id,
        videoFileName: delVideo.videoFileName,
        deletedBy: req.user._id
      });
      return res.status(200).json(
        new ApiResponse(200, null, 'Video deleted successfully')
      );
    }

    throw new ApiError(404, 'Video not found');
  } catch (error) {
    next(error);
  }
};

/**
 * Toggle Like / Unlike
 * POST /api/videos/:id/like
 */
export const toggleLike = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    let video;
    if (mongoose.connection.readyState === 1 && mongoose.Types.ObjectId.isValid(id)) {
      try {
        video = await Video.findById(id);
      } catch {
        // fallback
      }
    }

    if (!video) {
      const fallbackVideo = FALLBACK_STREAMS.find((s) => s._id === id);
      if (fallbackVideo) {
        if (!Array.isArray(fallbackVideo.likes)) {
          fallbackVideo.likes = [];
        }
        const userLikedIndex = fallbackVideo.likes.indexOf(userId);
        let isLiked = false;
        if (userLikedIndex > -1) {
          fallbackVideo.likes.splice(userLikedIndex, 1);
          fallbackVideo.likesCount = Math.max(0, (fallbackVideo.likesCount || 1) - 1);
          isLiked = false;
        } else {
          fallbackVideo.likes.push(userId);
          fallbackVideo.likesCount = (fallbackVideo.likesCount || 0) + 1;
          isLiked = true;
        }
        return res.status(200).json(
          new ApiResponse(
            200,
            {
              isLiked,
              likesCount: fallbackVideo.likesCount
            },
            isLiked ? 'Video liked' : 'Video unliked'
          )
        );
      }

      return res.status(200).json(
        new ApiResponse(200, { isLiked: true, likesCount: 43 }, 'Video liked')
      );
    }

    const alreadyLiked = video.likes.some((like) => like.toString() === userId.toString());

    if (alreadyLiked) {
      video.likes = video.likes.filter((like) => like.toString() !== userId.toString());
    } else {
      video.likes.push(userId);
    }

    await video.save();

    res.status(200).json(
      new ApiResponse(
        200,
        {
          isLiked: !alreadyLiked,
          likesCount: video.likes.length
        },
        alreadyLiked ? 'Video unliked' : 'Video liked'
      )
    );
  } catch (error) {
    next(error);
  }
};
