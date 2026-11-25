# StreamPulse — Twitch-Inspired Full-Stack Video Streaming Web Application

A full-stack, production-grade video streaming web platform designed with **Twitch's broadcast dark aesthetic** down to exact spacing, color tokens, and interactive components. Written in **pure modern JavaScript (ES6+)** with a Node.js/Express backend, MongoDB persistence, and a React + Tailwind CSS client.

---

## 1. Core Architecture & Feature Overview

StreamPulse provides a complete video streaming lifecycle:

- **Custom HTTP 206 Partial Content Streaming Engine**: High-performance byte-range audio/video streaming using native Node.js `fs.createReadStream`, Buffers, and Range header computation.
- **Robust Thumbnail & Media Delivery (Zero Broken Links)**:
  - **Top 5 Live Carousel**: 5 local 16:9 cinematic thumbnails (`/client/public/thumbnails/live-1.png` through `live-5.png`) for live broadcasts.
  - **20 Normal-Length Video Grid**: 20 distinct 16:9 local stock thumbnails (`/client/public/thumbnails/video-1.jpg` through `video-20.jpg`) covering Vlog, Sports, Movies, Tech, and Music categories.
  - **Bulletproof Fallback Strategy**: Universal `onError` event handling on all thumbnail `<img>` elements that seamlessly recovers to `/thumbnails/default-thumbnail.jpg`.
  - **User Uploads via Multer**: Multi-part form uploads persist video files to `/server/uploads/videos/` and cover thumbnails to `/server/uploads/thumbnails/`, instantly served through the Vite dev proxy and Express static middleware.
- **Authentication & RBAC**: Secure JWT authentication with Bcrypt password hashing and role-based permissions (`creator`, `viewer`, `admin`).
- **Interactive Social & Community Features**:
  - Real-time live chat panel with REST polling (4-second interval) and Twitch-style colored usernames.
  - Creator channel follow/unfollow system.
  - Video like/unlike toggle with dynamic counters.
  - Video comment moderation.
- **Creator Studio & Analytics**:
  - Live upload progress bar (`onUploadProgress`) with byte counters.
  - Channel analytics powered by MongoDB `$facet` and `$group` aggregation pipelines.
  - Video management dashboard with inline metadata editing and cascade deletion.

---

## 2. Twitch-Authentic Visual Design System

- **Exact Color Palette**:
  - Canvas background: `#0E0E10` (`bg-twitch-bg`)
  - Top bar, left sidebar & chat rail: `#18181B` (`bg-twitch-sidebar`)
  - Cards & elevated inputs: `#1F1F23` (`bg-twitch-card`)
  - Subtle borders/dividers: `#2F2F35` (`border-twitch-border`)
  - Brand accent (Twitch Purple): `#9147FF` (hover `#772CE8`) (`bg-twitch-purple`)
  - Live / Streaming badge: `#EB0400` (`bg-twitch-live`)
  - Primary text: `#EFEFF1`, Secondary muted text: `#ADADB8`
- **Persistent 3-Pane App Shell**:
  1. **Sticky Top Navbar (`h-[50px]`)**: Broadcast logo, Following & Browse tabs with purple bottom indicators, search input with `#2F2F35` border and `#9147FF` focus ring, Creator Studio action, and User Profile menu.
  2. **Collapsible Left Sidebar (`w-60` / `w-[50px]`)**: Recommended & Followed Channels list with creator avatars, handles, category subtitles, `#EB0400` live indicator dots, and compact viewer tallies.
  3. **Main Content Canvas**:
     - **Home Directory (`/`)**: Hero Spotlight live stream carousel with red `LIVE` badge, category filter pills (Vlog, Sports, Movies, Tech, Music), and dense 16:9 stream cards with **Twitch's signature purple corner-offset hover animation** (`-translate-y-1 translate-x-1` revealing a solid `#9147FF` frame).
     - **Watch Page (`/watch/:id`)**: 16:9 cinema video player with **Theater Mode toggle**, Channel header with purple ring border, follow button, like button, view count, and collapsible **Stream Chat panel** (`w-[340px]`).
     - **Creator Studio (`/upload`) & Dashboard (`/dashboard`)**: KPI analytics cards, category breakdown charts, and drag-and-drop upload zone with live upload progress tracking.

---

## 3. Quick Start Guide

### Prerequisites
- Node.js (v18+)
- MongoDB (Local instance or MongoDB Atlas URI in `.env`, or automatic dev in-memory fallback)

### Installation & Launch
From the project root:
```bash
# 1. Install all dependencies (root, server, and client)
npm run install:all

# 2. Seed database with initial creators, streams, followers, and chat messages
npm run server:seed

# 3. Start backend Express server and Vite React frontend concurrently
npm run dev
```

- **Frontend**: [http://localhost:5173](http://localhost:5173)
- **Backend API**: [http://localhost:5000](http://localhost:5000)

### Pre-Configured Demo Accounts (Ready for Testing)

| Role | Email | Password | Permissions |
| :--- | :--- | :--- | :--- |
| **Creator** | `creator@example.com` | `password123` | Upload streams, manage broadcasts in Creator Studio, view analytics, stream chat |
| **Viewer** | `viewer@example.com` | `password123` | Stream videos, follow channels, toggle likes, participate in live chat |
| **Admin** | `admin@example.com` | `password123` | Full moderation access across all channels, streams, and chat messages |

---

## 4. HTTP 206 Partial Content Streaming Engine

When a client requests a video chunk (`GET /api/videos/:id/stream`):
1. The server checks file existence and retrieves byte length via `fs.statSync(videoPath).size`.
2. The server parses the HTTP `Range` request header (e.g. `bytes=0-1048576`).
3. Computes chunk byte boundaries: `start`, `end`, and `contentLength = end - start + 1`.
4. Responds with **HTTP 206 Partial Content**:
   - `Content-Range: bytes ${start}-${end}/${fileSize}`
   - `Accept-Ranges: bytes`
   - `Content-Length: ${contentLength}`
   - `Content-Type: video/mp4`
5. Pipes `fs.createReadStream(videoPath, { start, end }).pipe(res)`.
6. Emits `video:streamed` event via Node.js `EventEmitter` with chunk byte metrics and client IP.

---

## 5. REST API Specification

### Authentication (`/api/auth`)
- `POST /api/auth/register` — Register user (`name`, `email`, `password`)
- `POST /api/auth/login` — Login user (`email`, `password`), returns JWT
- `GET /api/auth/me` — Protected: current user profile & following list
- `POST /api/auth/follow/:creatorId` — Protected: toggle follow/unfollow a creator channel
- `GET /api/auth/channels` — Public: list recommended channels for the sidebar

### Streams & Videos (`/api/videos`)
- `GET /api/videos` — Public: list streams with `category`, `search`, `sort`, `page`, `limit`
- `GET /api/videos/:id/stream` — **HTTP 206 Partial Content** byte-range video streaming
- `GET /api/videos/analytics` & `GET /api/videos/stats` — Mongoose `.aggregate()` analytics pipeline
- `GET /api/videos/:id` — Public: stream metadata, increments views, populates creator
- `POST /api/videos` — Protected (`creator`, `admin`): upload MP4 video & thumbnail via Multer
- `PUT /api/videos/:id` — Protected (owner, `admin`): update stream metadata
- `DELETE /api/videos/:id` — Protected (owner, `admin`): cascade delete video, files, and comments
- `POST /api/videos/:id/like` — Protected: toggle like/unlike

### Stream Chat (`/api/videos/:id/comments`)
- `GET /api/videos/:id/comments` — Public: fetch latest chat messages (polled every 4 seconds)
- `POST /api/videos/:id/comments` — Protected: post message to stream chat
- `DELETE /api/comments/:id` — Protected (author, creator, `admin`): delete message
