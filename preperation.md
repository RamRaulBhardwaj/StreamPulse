# StreamPulse — Comprehensive University Viva Defense & Architecture Guide

> **Target Audience:** This document is prepared specifically for university oral examinations (viva voce) conducted by university professors. It explains **everything** about the StreamPulse project in clear, plain English—structured so that even someone with **zero prior JavaScript or web development knowledge** can confidently navigate the codebase, point to the exact lines of code, and answer any technical question asked by an examiner.

---

## Table of Contents
1. [The 30-Second Elevator Pitch (What to Say First)](#1-the-30-second-elevator-pitch)
2. [High-Level Architecture for Beginners](#2-high-level-architecture-for-beginners)
3. [Complete Code Map: Which File & Function Does What?](#3-complete-code-map)
4. [Deep Dive into Key Features (Line-by-Line Breakdown)](#4-deep-dive-into-key-features)
   - [Feature 1: HTTP 206 Partial Content Video Streaming (Professor's Favorite)](#feature-1-http-206-partial-content-video-streaming)
   - [Feature 2: Video & Thumbnail Upload via Multer](#feature-2-video--thumbnail-upload-via-multer)
   - [Feature 3: Robust Thumbnail Strategy & Zero Broken Links](#feature-3-robust-thumbnail-strategy--zero-broken-links)
   - [Feature 4: Authentication, Bcrypt Hashing & JWT Security](#feature-4-authentication-bcrypt-hashing--jwt-security)
   - [Feature 5: Role-Based Access Control (RBAC)](#feature-5-role-based-access-control-rbac)
   - [Feature 6: MongoDB Database Models, Indexes & Cascade Deletion](#feature-6-mongodb-database-models-indexes--cascade-deletion)
   - [Feature 7: MongoDB Aggregation Pipeline ($facet & $group Analytics)](#feature-7-mongodb-aggregation-pipeline)
   - [Feature 8: Node.js EventEmitter Lifecycle System](#feature-8-nodejs-eventemitter-lifecycle-system)
   - [Feature 9: Frontend React Architecture, State & Routing](#feature-9-frontend-react-architecture-state--routing)
   - [Feature 10: Live Stream Chat (REST Polling Engine)](#feature-10-live-stream-chat-rest-polling-engine)
5. [Top 25 Viva Examination Questions & Model Answers](#5-top-25-viva-examination-questions--model-answers)
6. [Demo Script (Step-by-Step Live Demonstration for Examiner)](#6-demo-script-for-examiner)

---

## 1. The 30-Second Elevator Pitch

When the examiner says: **"Tell me about your project in simple words"**, say:

> *"StreamPulse is a full-stack video streaming and broadcast web platform inspired by Twitch. It is built using pure modern JavaScript with a Node.js and Express backend, a MongoDB database, and a React frontend styled with Tailwind CSS.*
> 
> *The core technical highlight of the project is a custom **HTTP 206 Partial Content Video Streaming Engine**. Instead of forcing the user's browser to download an entire 200MB video file before playback, our backend reads the video in small 2-megabyte binary chunks on demand using Node.js filesystem streams and Buffer slices.*
> 
> *The platform includes full user authentication with Bcrypt password hashing, JSON Web Tokens (JWT), role-based permissions for Creators, Viewers, and Admins, video and thumbnail uploading with Multer, MongoDB aggregation analytics, and a Twitch-authentic dark broadcast interface with zero broken images."*

---

## 2. High-Level Architecture for Beginners

Think of StreamPulse like a high-end restaurant:

```
[User Browser (Client)]  <--- HTTP/JSON & Streams --->  [Express Server (Backend)]  <--->  [MongoDB Database]
    (Vite + React)                                            (Node.js)                         (Data)
          |                                                       |                                |
   Displays UI &                                          Processes Requests &             Stores Users,
   Video Controls                                         Streams Video Files              Metadata & Comments
                                                                  |
                                                          [Physical Disk Storage]
                                                          /server/uploads/videos/
                                                          /server/uploads/thumbnails/
```

- **Frontend (`/client`)**: The "Waiter" that takes orders from the user, shows the video player, chat box, cards, and handles user clicks. Built with **React** and **Tailwind CSS**.
- **Backend (`/server`)**: The "Kitchen Chef" that listens for requests, verifies tokens, processes business logic, and prepares data or video bytes. Built with **Node.js** and **Express**.
- **Database (MongoDB)**: The "Inventory Ledger" that stores structured information (User profiles, video titles, view counts, comment text, follower relationships).
- **Physical Disk Storage (`/server/uploads/`)**: The "Cold Storage Pantry" where the actual heavy binary `.mp4` video files and uploaded thumbnail images live. *(We never store heavy 200MB video files inside MongoDB directly because database documents have a strict 16MB limit).*

---

## 3. Complete Code Map

Here is the exact index of files in the project. If the professor points to any feature, refer to this table:

### Backend Files (`/server/src/`)

| File Path | Purpose in Plain English | Key Functions / Exports |
| :--- | :--- | :--- |
| `server.js` | Entry point that starts the server listening on port 5000 and connects to MongoDB. | `startServer()` |
| `app.js` | Configures Express, CORS, JSON parsers, static routes, and mounts API routers. | `app` |
| `config/db.js` | Handles database connection to MongoDB with auto-reconnect and error handling. | `connectDB()` |
| `config/logger.js` | Structured Winston logger for recording info, warnings, errors, and streaming events. | `logger` |
| `controllers/videoController.js` | **Heart of the backend**: Handles HTTP 206 streaming, video listing, creation, updating, likes, and deletion. | `streamVideo()`, `getVideos()`, `createVideo()`, `deleteVideo()`, `toggleLike()` |
| `controllers/authController.js` | Handles user registration, login, JWT token generation, channel profiles, and following. | `register()`, `login()`, `getCurrentUser()`, `toggleFollow()` |
| `controllers/commentController.js`| Handles live stream chat messages: posting, fetching by video ID, and deletion. | `getCommentsByVideo()`, `createComment()`, `deleteComment()` |
| `controllers/statsController.js` | Runs MongoDB aggregation pipelines for Creator Studio dashboard KPI metrics. | `getVideoStats()` |
| `events/videoEvents.js` | Node.js `EventEmitter` instance that broadcasts events (`video:uploaded`, `video:streamed`, `video:deleted`). | `videoEventEmitter` |
| `middlewares/authMiddleware.js` | Intercepts requests, validates the JWT Bearer token in headers, and attaches `req.user`. | `protect()` |
| `middlewares/roleMiddleware.js` | Enforces Role-Based Access Control (e.g. only `creator` or `admin` can upload). | `authorizeRoles()` |
| `middlewares/uploadMiddleware.js`| Configures **Multer** disk storage, file size limits (200MB), and format filtering (`.mp4`, `.png`, `.jpg`). | `uploadMedia` |
| `middlewares/errorMiddleware.js` | Central error handler that formats all errors into clean JSON responses with HTTP status codes. | `errorHandler()` |
| `middlewares/validateMiddleware.js`| Checks express-validator validation results and halts with status 400 if validation fails. | `validate()` |
| `models/User.js` | Mongoose schema for users: fields, Bcrypt pre-save password hash hook, and password compare method. | `User` |
| `models/Video.js` | Mongoose schema for videos: compound indexes, text search index, `$facet` aggregation, and cascade delete hook. | `Video` |
| `models/Comment.js` | Mongoose schema for chat messages referencing user and video IDs. | `Comment` |
| `routes/videoRoutes.js` | Maps URL endpoints (`GET /stream/:id`, `POST /`, `DELETE /:id`) to controller functions. | Express `router` |
| `routes/authRoutes.js` | Maps `/api/auth/register`, `/api/auth/login`, `/api/auth/me`, `/api/auth/follow/:id`. | Express `router` |
| `routes/commentRoutes.js`| Maps `/api/videos/:id/comments` and `/api/comments/:id`. | Express `router` |
| `utils/seeder.js` | Script that populates MongoDB with 25 seed streams, 6 creators, followers, and sample chat messages. | `seedData()` |

### Frontend Files (`/client/src/`)

| File Path | Purpose in Plain English | Key Concepts / Hooks |
| :--- | :--- | :--- |
| `main.jsx` | Mounts the React application into the root DOM element in `index.html`. | `createRoot()` |
| `App.jsx` | Sets up application routes with React Router (`/`, `/watch/:id`, `/upload`, `/dashboard`, `/login`). | `<Routes>`, `<Route>`, `<TwitchNavbar>` |
| `utils/thumbnailUtils.js` | **Universal thumbnail helper**: Resolves uploaded, seeded, or carousel thumbnails and catches errors. | `getThumbnailUrl()`, `handleThumbnailError()` |
| `components/video/TwitchPlayer.jsx` | Custom 16:9 HTML5 video player component that consumes the HTTP 206 chunk stream. | `<video>`, `useRef()`, `onToggleTheater` |
| `components/video/HeroSpotlight.jsx`| Top broadcast carousel on Home page featuring the 5 live streams with prev/next controls. | `useState()`, live badge, thumbnail |
| `components/video/StreamCard.jsx` | 16:9 stream card with Twitch purple corner-offset hover animation and view counters. | `group-hover:-translate-y-1` |
| `components/video/ChannelHeader.jsx`| Channel meta area under player with creator avatar, handle, Follow button, and Like button. | Follow toggle, Like toggle |
| `components/CommentSection.jsx` | Stream live chat pane with 4-second REST polling, role badges, and emote pickers. | `useState()`, `useEffect()`, `setInterval()` |
| `pages/Home.jsx` | Main browse directory with Hero Spotlight, category filters (Vlog, Sports, Movies, Tech, Music), and video grid. | `useSearchParams()`, `useCallback()` |
| `pages/Watch.jsx` | Dedicated video watch page coordinating player, channel header, theater mode, and chat. | `useParams()`, `videoService.getVideoById()` |
| `pages/Upload.jsx` | Creator Studio upload form featuring drag-and-drop file picker and live upload progress bar. | `FormData()`, `onUploadProgress` |
| `pages/Dashboard.jsx` | Creator analytics page with KPI counters, category distribution tables, and delete buttons. | `videoService.getStats()`, cascade delete |
| `context/AuthContext.jsx` | Global authentication state provider managing user session, login, register, and logout. | `createContext()`, `useReducer()` |
| `context/authReducer.js` | Reducer function managing auth state transitions (`LOGIN_SUCCESS`, `LOGOUT`, `AUTH_ERROR`). | Pure reducer function |
| `services/api.js` | Axios instance configured with JWT request interceptor and response error handling. | `axios.create()`, interceptors |
| `services/videoService.js` | Frontend API client communicating with `/api/videos` endpoints. | Axios calls |
| `services/authService.js` | Frontend API client communicating with `/api/auth` endpoints. | Axios calls |

---

## 4. Deep Dive into Key Features (Line-by-Line Breakdown)

### Feature 1: HTTP 206 Partial Content Video Streaming
- **Location:** [`server/src/controllers/videoController.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/controllers/videoController.js#L466-L565)
- **Function Name:** `export const streamVideo = async (req, res, next) => { ... }`

#### How It Works Step-by-Step:
1. **Find File & Measure Byte Length (Lines 507–508):**
   ```javascript
   const stat = fs.statSync(videoPath);
   const fileSize = stat.size;
   ```
   *Explanation:* `fs.statSync` queries the operating system filesystem to find the exact byte size of the MP4 file without loading the file into RAM.
2. **Read the HTTP `Range` Header Sent by Browser (Line 509):**
   ```javascript
   const range = req.headers.range;
   ```
   *Explanation:* Modern browsers automatically send a `Range` header when playing videos, e.g. `bytes=0-` (start from beginning) or `bytes=10485760-` (user clicked 5 minutes into the video).
3. **Parse Byte Boundaries & Define Chunk Size (Lines 521–524):**
   ```javascript
   const parts = range.replace(/bytes=/, '').split('-');
   const start = parseInt(parts[0], 10);
   const CHUNK_SIZE = 2 * 1024 * 1024; // 2 Megabytes
   const end = parts[1] ? parseInt(parts[1], 10) : Math.min(start + CHUNK_SIZE, fileSize - 1);
   ```
   *Explanation:* We take the requested start byte, add 2MB (`CHUNK_SIZE`), and compute the exact slice of bytes to send.
4. **Respond with HTTP Status 206 Partial Content (Lines 533–540):**
   ```javascript
   const headers = {
     'Content-Range': `bytes ${start}-${end}/${fileSize}`,
     'Accept-Ranges': 'bytes',
     'Content-Length': contentLength,
     'Content-Type': mimeType
   };
   res.writeHead(206, headers);
   ```
   *Explanation:*
   - `HTTP 206` tells the browser: *"This is not the full file; this is only the byte slice you asked for."*
   - `Content-Range: bytes 0-2097152/52428800` tells the browser: *"Here are bytes 0 to 2MB out of a 50MB file."*
   - `Accept-Ranges: bytes` tells the browser: *"You are allowed to jump to any byte offset anytime."*
5. **Stream Chunk via Node.js Pipe (Lines 542 & 555):**
   ```javascript
   const videoStream = fs.createReadStream(videoPath, { start, end });
   videoStream.pipe(res);
   ```
   *Explanation:* `fs.createReadStream` reads only the byte window from disk into a memory Buffer and `pipe(res)` sends it directly down the network socket to the client. When the client closes the tab, `req.on('close')` destroys the stream immediately to prevent memory leaks!

---

### Feature 2: Video & Thumbnail Upload via Multer
- **Location:** [`server/src/middlewares/uploadMiddleware.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/middlewares/uploadMiddleware.js#L21-L76)
- **Controller Handling:** [`server/src/controllers/videoController.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/controllers/videoController.js#L571-L640) (`createVideo`)

#### How It Works:
1. **Disk Storage Routing (Lines 22–37 in `uploadMiddleware.js`):**
   ```javascript
   const storage = multer.diskStorage({
     destination: (req, file, cb) => {
       if (file.fieldname === 'video') cb(null, videoUploadDir);
       else if (file.fieldname === 'thumbnail') cb(null, thumbnailUploadDir);
     },
     filename: (req, file, cb) => {
       const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
       cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
     }
   });
   ```
   - Video files are placed in `/server/uploads/videos/`.
   - Thumbnail images are placed in `/server/uploads/thumbnails/`.
   - Files are renamed with a unique timestamp to prevent name collisions.
2. **Format and Size Validation (Lines 40–76 in `uploadMiddleware.js`):**
   - Video must have MIME type `video/mp4` and end with `.mp4`.
   - Thumbnail must be `jpeg`, `jpg`, `png`, or `webp`.
   - Maximum upload limit is strictly enforced at 200MB (`limits: { fileSize: 200 * 1024 * 1024 }`).
3. **Database Insertion (Lines 591–605 in `videoController.js`):**
   The controller saves the filenames (`videoFile.filename` and `thumbnailFile.filename`) in the MongoDB `Video` document.

---

### Feature 3: Robust Thumbnail Strategy & Zero Broken Links
- **Location:** [`client/src/utils/thumbnailUtils.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/client/src/utils/thumbnailUtils.js#L1-L54)
- **Component Consumption:** `HeroSpotlight.jsx`, `StreamCard.jsx`, `Watch.jsx`, `Dashboard.jsx`, `VideoCard.jsx`

#### How It Works:
The examiner may ask: *"How do you guarantee that no broken images or missing thumbnail boxes ever appear on the website?"*

Answer with these 4 pillars:
1. **5 Local 16:9 Live Broadcast Thumbnails:** Saved locally on disk in `/client/public/thumbnails/live-1.png` through `live-5.png` (gaming setup, live coding desk, esports stage, music studio, live sports arena). Served directly at `/thumbnails/live-X.png`.
2. **20 Local 16:9 Stock Thumbnails:** Saved locally on disk in `/client/public/thumbnails/video-1.jpg` through `video-20.jpg` matching the categories (Vlog, Sports, Movies, Tech, Music).
3. **User Upload Support:** When a user uploads a custom thumbnail via Multer, `getThumbnailUrl()` detects that it is an uploaded file name (e.g. `thumbnail-1732...png`) and routes it to `/uploads/thumbnails/${filename}`, which Express serves statically from `/server/uploads/thumbnails/`.
4. **Universal `onError` Recovery Handler:**
   ```javascript
   export const handleThumbnailError = (e) => {
     e.currentTarget.onerror = null; // Prevents infinite loop
     e.currentTarget.src = '/thumbnails/default-thumbnail.jpg';
   };
   ```
   Every thumbnail `<img>` tag in the app has `onError={handleThumbnailError}`. If an image fails to load for *any* reason (network drop, missing file, 404), the browser instantaneously swaps it to `/thumbnails/default-thumbnail.jpg`. **Zero broken image icons are ever visible.**

---

### Feature 4: Authentication, Bcrypt Hashing & JWT Security
- **Mongoose User Model:** [`server/src/models/User.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/models/User.js#L78-L95)
- **Controller:** [`server/src/controllers/authController.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/controllers/authController.js#L8-L120)
- **Middleware:** [`server/src/middlewares/authMiddleware.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/middlewares/authMiddleware.js#L1-L45)

#### How It Works:
1. **Bcrypt Pre-Save Hook (Lines 78–86 in `User.js`):**
   ```javascript
   userSchema.pre('save', async function (next) {
     if (!this.isModified('password')) return next();
     const salt = await bcrypt.genSalt(10);
     this.password = await bcrypt.hash(this.password, salt);
     next();
   });
   ```
   *Explanation:* Passwords are never stored in plaintext. Before saving a user into MongoDB, Mongoose generates a 10-round cryptographic salt and hashes the password.
2. **Password Verification (Lines 88–91 in `User.js` & Line 92 in `authController.js`):**
   ```javascript
   const isMatch = await user.comparePassword(candidatePassword);
   ```
   *Explanation:* Uses `bcrypt.compare(candidate, hash)`. Even administrators cannot see user passwords.
3. **JSON Web Token Generation (Lines 8–14 in `authController.js`):**
   ```javascript
   jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '7d' });
   ```
   *Explanation:* Upon login, the server signs a cryptographic token containing the user's ID valid for 7 days.
4. **Token Verification on Protected Routes (`authMiddleware.js`):**
   When the client makes a request, `api.js` attaches `Authorization: Bearer <token>`. The `protect` middleware splits the header, verifies the signature with `jwt.verify()`, finds the user in MongoDB, and attaches `req.user = user`.
5. **Strict Email & Password Validation (`authValidation.js`):**
   - **Email Validation:** Trims and lowercases the input. Enforces strict RFC formatting, checks local-part boundaries (no consecutive dots or spaces), rejects single-character domain labels (`j.com`, `a.co`), rejects fake local parts (`fake`, `test`, `dummy`, `asdf`, `qwerty`, `abc`, `123`, `temp`, `noreply`), rejects disposable domains (`mailinator.com`, `yopmail.com`, `example.com`, etc.), and performs a real DNS MX mail-server resolution using Node.js's built-in `dns/promises` (`resolveMx`) on registration. Returns exact message: `"Email is invalid"`.
   - **Password Complexity:** Requires at least one letter (`/[A-Za-z]/`) AND at least one number (`/[0-9]/`). If missing, displays: `"Your password doesn't contain a letter or number, try adding some"`. Enforces a minimum length of 6 characters (`"Password must be at least 6 characters"`).
   - **UI Feedback:** Forms use `noValidate` to disable browser popups, render inline red error messages with `border-red-500`, and clear errors automatically as the user types.

---

### Feature 5: Role-Based Access Control (RBAC)
- **Location:** [`server/src/middlewares/roleMiddleware.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/middlewares/roleMiddleware.js#L1-L20)
- **Routes Guarded:** [`server/src/routes/videoRoutes.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/routes/videoRoutes.js#L44-L65)

#### How It Works:
```javascript
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new ApiError(403, `Access denied. Role '${req.user?.role}' is unauthorized`);
    }
    next();
  };
};
```
- **Viewer:** Can watch streams, like videos, follow creators, and post in chat.
- **Creator:** Everything a Viewer can do + access Creator Studio (`/upload`), upload new videos, view analytics dashboard, and manage their own uploads.
- **Admin:** Full moderation access across all channels, edit/delete any video, and delete any chat message.

---

### Feature 6: MongoDB Database Models, Indexes & Cascade Deletion
- **Location:** [`server/src/models/Video.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/models/Video.js#L89-L205)

#### High-Performance Indexes:
1. **Compound Index (Line 91):**
   ```javascript
   videoSchema.index({ category: 1, createdAt: -1 });
   ```
   *Why this matters:* When users filter by category (e.g. `Tech`) sorted by newest, MongoDB uses an index tree rather than scanning every document in the collection, cutting query time from hundreds of milliseconds to under 2ms.
2. **Full-Text Search Index (Line 94):**
   ```javascript
   videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
   ```
   *Why this matters:* Enables MongoDB `$text: { $search: query }` matching across title, description, and tags simultaneously.

#### Cascade Deletion Post-Hook (Lines 179–205 in `Video.js`):
When a video is deleted via `Video.findOneAndDelete({ _id: id })`:
1. It automatically deletes all associated chat comments: `await Comment.deleteMany({ video: doc._id })`.
2. It removes the physical `.mp4` video file from `/server/uploads/videos/` using `fs.unlinkSync()`.
3. If an uploaded thumbnail exists, it removes it from `/server/uploads/thumbnails/` using `fs.unlinkSync()`.

---

### Feature 7: MongoDB Aggregation Pipeline ($facet & $group Analytics)
- **Location:** [`server/src/models/Video.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/models/Video.js#L119-L172) (`getCategoryAnalytics`)
- **Controller:** [`server/src/controllers/statsController.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/controllers/statsController.js#L1-L40)

#### Why Use `$facet`?
In standard database queries, getting:
1. Video counts and view counts grouped by category,
2. Platform-wide totals (total videos, total views, total gigabytes),
3. Top 5 most viewed videos,
would require 3 separate database queries.

With **MongoDB `$facet`**, we execute all 3 sub-pipelines inside a **single database aggregation**:
- **Pipeline 1 (`categoryBreakdown`):** Uses `$group` by `category`, calculates `$sum: '$views'` and `$avg: '$size'`.
- **Pipeline 2 (`overview`):** Uses `$group: { _id: null }` to calculate total platform videos, views, and storage size.
- **Pipeline 3 (`topStreams`):** Uses `$sort: { views: -1 }`, `$limit: 5`, and `$lookup` to join creator avatars.

---

### Feature 8: Node.js EventEmitter Lifecycle System
- **Location:** [`server/src/events/videoEvents.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/server/src/events/videoEvents.js#L1-L33)

#### How It Works:
Node.js has a built-in `EventEmitter` class. StreamPulse decouples business events from HTTP responses:
- `videoEventEmitter.emit('video:uploaded', { ... })` -> Logged by Winston with creator metrics.
- `videoEventEmitter.emit('video:streamed', { ... })` -> Emitted each time an HTTP 206 chunk is transmitted, recording client IP and chunk boundaries.
- `videoEventEmitter.emit('video:deleted', { ... })` -> Records audit trail of deletions.

---

### Feature 9: Frontend React Architecture, State & Routing
- **Entry & Routes:** [`client/src/App.jsx`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/client/src/App.jsx)
- **Global Auth:** [`client/src/context/AuthContext.jsx`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/client/src/context/AuthContext.jsx)
- **Axios Interceptor:** [`client/src/services/api.js`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/client/src/services/api.js)

#### How It Works:
1. **React Router DOM:** Nested URL routing:
   - `/` -> `Home.jsx`
   - `/watch/:id` -> `Watch.jsx`
   - `/upload` -> `Upload.jsx` (Guarded by `<ProtectedRoute allowedRoles={['creator', 'admin']}>`)
   - `/dashboard` -> `Dashboard.jsx` (Guarded by `<ProtectedRoute allowedRoles={['creator']}>`)
   - `/login` & `/register` -> Authentication pages
2. **Auth Context + Reducer:** Manages login state globally across the tree. `localStorage.getItem('token')` persists the session across browser refreshes.
3. **Vite Proxy (`client/vite.config.js`):**
   ```javascript
   server: {
     proxy: {
       '/api': { target: 'http://localhost:5000', changeOrigin: true },
       '/uploads': { target: 'http://localhost:5000', changeOrigin: true }
     }
   }
   ```
   *Why this matters:* The frontend runs on `localhost:5173` and the backend on `localhost:5000`. The Vite proxy prevents CORS issues during development and allows the client to make clean requests to `/api/videos` and `/uploads/thumbnails/...`.

---

### Feature 10: Live Stream Chat (REST Polling Engine)
- **Location:** [`client/src/components/CommentSection.jsx`](file:///c:/STUDY%20MATERIAL/New%20folder/BEE%20Project/client/src/components/CommentSection.jsx#L16-L30)

#### How It Works:
To keep the application lightweight without requiring complex WebSocket or Socket.IO server processes:
1. When the user opens `/watch/:id`, `CommentSection.jsx` calls `fetchComments()` on mount.
2. Users can submit chat messages containing text and emotes.
3. Moderation permissions: Creators and Admins have delete buttons beside messages to remove spam instantly.

---

## 5. Top 25 Viva Examination Questions & Model Answers

### Q1: What is HTTP Status Code 206 and why did you use it?
- **Answer:** HTTP 206 stands for **Partial Content**. We use it for video streaming because video files are large (e.g. 50MB–200MB). Sending the entire file with HTTP 200 would require the user to wait until the entire video downloads before playing. HTTP 206 allows the server to send small 2MB chunks on demand as requested by the browser's `Range` header.
- **Where in code:** `server/src/controllers/videoController.js`, lines 533–540 (`res.writeHead(206, headers)`).

### Q2: How does the browser know how to ask for a specific part of a video?
- **Answer:** The browser sends an HTTP `Range` request header, such as `Range: bytes=0-` or `Range: bytes=10485760-20971520`. The server parses this string with `.split('-')`, calculates the start and end byte offsets, and reads only that slice from disk.
- **Where in code:** `server/src/controllers/videoController.js`, lines 509–524.

### Q3: Why did you use `fs.createReadStream()` instead of `fs.readFile()`?
- **Answer:** `fs.readFile()` loads the entire file into server RAM all at once. If 20 users request a 200MB video simultaneously, `fs.readFile()` would consume 4 Gigabytes of server memory, crashing the Node.js process. `fs.createReadStream({ start, end })` only buffers small 64KB chunks into memory and streams them through `pipe(res)`, keeping RAM usage under a few megabytes.
- **Where in code:** `server/src/controllers/videoController.js`, lines 542 & 555.

### Q4: Where are the uploaded videos and thumbnails stored?
- **Answer:** They are stored on the physical server hard drive in `/server/uploads/videos/` and `/server/uploads/thumbnails/`. Only the filenames, metadata, and byte sizes are stored in the MongoDB database documents.
- **Where in code:** `server/src/middlewares/uploadMiddleware.js`, lines 22–37.

### Q5: Why don't you store video files directly in MongoDB?
- **Answer:** MongoDB BSON documents have a hard limit of 16 Megabytes per document. Video files typically range from 20MB to several gigabytes. Furthermore, databases are optimized for querying structured data, not serving high-throughput binary media streams.

### Q6: How does password security work in this project?
- **Answer:** Passwords are never stored in plain text. In the Mongoose `User` model, we have a `pre('save')` hook that checks if the password was modified, generates a salt using `bcrypt.genSalt(10)`, and hashes the password with `bcrypt.hash()`. During login, we verify passwords using `bcrypt.compare()`.
- **Where in code:** `server/src/models/User.js`, lines 78–91.

### Q7: What is a JSON Web Token (JWT) and how does authentication persist?
- **Answer:** A JWT is a digitally signed string containing a payload (user ID) and an expiration time (7 days). When a user logs in, the backend signs the token using a secret key. The frontend stores this token in browser `localStorage`. For all subsequent protected API requests, an Axios interceptor attaches the token to the `Authorization: Bearer <token>` header.
- **Where in code:** Server: `authController.js` (line 8) and `authMiddleware.js`. Client: `api.js` (line 12).

### Q8: What is Role-Based Access Control (RBAC) and how is it implemented?
- **Answer:** RBAC restricts access to endpoints based on user roles (`viewer`, `creator`, `admin`). It is implemented via custom Express middleware `authorizeRoles('creator', 'admin')`. If a user with role `viewer` attempts to call `POST /api/videos` to upload a video, the middleware intercepts the request and returns HTTP 403 Forbidden.
- **Where in code:** `server/src/middlewares/roleMiddleware.js`, lines 1–15.

### Q9: What happens when a video is deleted? (Cascade Deletion)
- **Answer:** When an authorized creator or admin calls `DELETE /api/videos/:id`, Mongoose executes a `post('findOneAndDelete')` hook. This hook automatically:
  1. Deletes all comments associated with that video in MongoDB (`Comment.deleteMany`).
  2. Deletes the physical `.mp4` video file from `/server/uploads/videos/` using `fs.unlinkSync()`.
  3. Deletes the uploaded thumbnail file from `/server/uploads/thumbnails/`.
- **Where in code:** `server/src/models/Video.js`, lines 179–205.

### Q10: How do you prevent broken thumbnail images?
- **Answer:** We have a multi-tier thumbnail strategy:
  1. 5 local 16:9 carousel thumbnails (`live-1.png` .. `live-5.png`) for live streams.
  2. 20 local 16:9 stock thumbnails (`video-1.jpg` .. `video-20.jpg`) for category videos.
  3. Multer uploads served from `/server/uploads/thumbnails/`.
  4. A universal `onError` handler on every `<img>` element that catches missing images and automatically falls back to `/thumbnails/default-thumbnail.jpg`.
- **Where in code:** `client/src/utils/thumbnailUtils.js`, lines 1–54.

### Q11: What is a Mongoose Compound Index and why did you use one?
- **Answer:** An index on two fields simultaneously: `videoSchema.index({ category: 1, createdAt: -1 })`. We use it because the most frequent user query is filtering videos by category (e.g. `Sports`) sorted by newest first. The compound index allows MongoDB to satisfy both the filter and the sort in a single B-tree index lookup without an expensive in-memory sort.
- **Where in code:** `server/src/models/Video.js`, line 91.

### Q12: What is the purpose of `videoSchema.index({ title: 'text', description: 'text', tags: 'text' })`?
- **Answer:** It creates a MongoDB Full-Text Search index. When a user types a search query in the top navbar, the server can run `$text: { $search: query }` to search across titles, descriptions, and tag arrays in a single indexed operation.
- **Where in code:** `server/src/models/Video.js`, line 94.

### Q13: What is MongoDB `$facet` in the aggregation pipeline?
- **Answer:** `$facet` allows executing multiple aggregation pipelines within a single stage on the same input documents. In our Creator Studio analytics, we use `$facet` to compute category breakdown statistics, platform-wide metrics, and top streams in one database roundtrip.
- **Where in code:** `server/src/models/Video.js`, lines 119–172 (`getCategoryAnalytics`).

### Q14: How does the client upload a video with a progress bar?
- **Answer:** The client uses the browser `FormData` API to append the video file and thumbnail file. It sends a `POST` request with Axios, configuring the `onUploadProgress` callback:
  `const percent = Math.round((progressEvent.loaded * 100) / progressEvent.total)`.
  This updates React state to render the live Twitch-purple progress bar.
- **Where in code:** `client/src/pages/Upload.jsx`, lines 90–94.

### Q15: What is Multer and how is it configured?
- **Answer:** Multer is an Express middleware for handling `multipart/form-data` uploads. We configure it with `multer.diskStorage` to set destination directories and unique filenames, a `fileFilter` function to validate file extensions and MIME types, and `limits: { fileSize: 200MB }`.
- **Where in code:** `server/src/middlewares/uploadMiddleware.js`, lines 22–76.

### Q16: How does the backend communicate with the frontend during development?
- **Answer:** Vite's development server (`localhost:5173`) runs a reverse proxy configured in `vite.config.js`. Any request starting with `/api` or `/uploads` is automatically forwarded to the Express server running on `http://localhost:5000`. This eliminates CORS errors during local development.
- **Where in code:** `client/vite.config.js`, lines 9–18.

### Q17: What is Node.js `EventEmitter` and how is it used in this project?
- **Answer:** `EventEmitter` is a core Node.js module implementing the Publish-Subscribe pattern. In `videoEvents.js`, we create `videoEventEmitter` and emit events like `video:uploaded` and `video:streamed`. This decouples analytics and structured logging from HTTP controller handlers.
- **Where in code:** `server/src/events/videoEvents.js`, lines 1–33.

### Q18: What is the purpose of `express.static()` in `app.js`?
- **Answer:** `express.static()` is built-in middleware that serves static asset files directly to HTTP clients. We use `app.use('/uploads/thumbnails', express.static(...))` so uploaded thumbnail images can be requested directly by the browser.
- **Where in code:** `server/src/app.js`, lines 39–42.

### Q19: What is React `useReducer` and why did you use it for authentication?
- **Answer:** `useReducer` is an alternative to `useState` for managing complex state transitions. In `AuthContext.jsx`, authentication involves multiple interdependent states (`user`, `token`, `isAuthenticated`, `loading`, `error`). Using `useReducer` with an action-based reducer (`authReducer.js`) makes state updates predictable and centralized.
- **Where in code:** `client/src/context/AuthContext.jsx`, line 8.

### Q20: How does the Like/Unlike toggle work?
- **Answer:** The `Video` model stores an array of user ObjectIds: `likes: [{ type: ObjectId, ref: 'User' }]`. When a user clicks Like, the server checks if their ID is already in the array:
  - If present: Removes it using MongoDB `$pull` (Unlike).
  - If absent: Adds it using MongoDB `$addToSet` (Like).
  The endpoint returns the updated count and boolean `isLiked`.
- **Where in code:** `server/src/controllers/videoController.js`, lines 925–985.

### Q21: How does the Follow/Unfollow creator feature work?
- **Answer:** The `User` model contains `following` and `followers` arrays. When a viewer clicks Follow on a creator's channel, `toggleFollow` atomically adds the creator's ID to the viewer's `following` array and adds the viewer's ID to the creator's `followers` array. Clicking again removes both.
- **Where in code:** `server/src/controllers/authController.js`, lines 280–345.

### Q22: What happens if MongoDB is offline or unavailable?
- **Answer:** The project includes resilient dev-mode fallback arrays (`FALLBACK_STREAMS` and in-memory mock models in `videoController.js` and `authController.js`). If `mongoose.connection.readyState !== 1`, the app seamlessly switches to in-memory fallback data so the demo never crashes during presentation!
- **Where in code:** `server/src/controllers/videoController.js`, lines 26–459.

### Q23: What is the Theater Mode feature?
- **Answer:** On `/watch/:id`, clicking the Theater Mode button expands the 16:9 video player to span 100% of the viewport width while moving comments beneath it, replicating the cinema experience seen on Twitch and YouTube.
- **Where in code:** `client/src/pages/Watch.jsx`, line 100, and `TwitchPlayer.jsx`.

### Q24: What is the purpose of Winston Logger in `logger.js`?
- **Answer:** Winston provides structured, production-grade logging. Rather than using raw `console.log`, Winston formats log entries with timestamps, severity levels (`info`, `warn`, `error`, `stream`), and outputs them cleanly to terminal and log files.
- **Where in code:** `server/src/config/logger.js`, lines 1–40.

### Q25: How does the app ensure responsiveness across mobile, tablet, and desktop?
- **Answer:** Using Tailwind CSS responsive breakpoints (`sm:`, `md:`, `lg:`, `xl:`). For example, the video grid displays 1 column on mobile (`grid-cols-1`), 2 on tablets (`sm:grid-cols-2`), 3 on laptops (`lg:grid-cols-3`), and 4 on desktop screens (`xl:grid-cols-4`). The left sidebar is collapsible.
- **Where in code:** `client/src/pages/Home.jsx`, line 314, and `client/src/components/layout/LeftSidebar.jsx`.

---

## 6. Demo Script for Examiner

Follow this 5-minute checklist during your live viva demonstration:

1. **Start the Application:**
   ```bash
   npm run server:seed   # Seeds 25 videos & demo accounts
   npm run dev           # Starts backend on 5000 and frontend on 5173
   ```
2. **Show the Home Page (`http://localhost:5173`):**
   - Point out the **Top Hero Carousel**: 5 live stream thumbnails (`live-1.png` .. `live-5.png`) with red `LIVE` badges and viewer counts. Click the navigation arrows to cycle streams.
   - Point out the **Category Pills**: Click `Tech`, `Sports`, `Music`, `Vlog`, or `Movies`. Show how the video grid instantly filters without page reload.
   - Hover over any video card to show the **Twitch Purple corner-offset animation** (`-translate-y-1 translate-x-1`).
3. **Show Video Playback & HTTP 206 Streaming:**
   - Click on any video to navigate to `/watch/:id`.
   - Open Chrome DevTools (`F12`), switch to the **Network** tab, filter by `Media` or `Fetch/XHR`.
   - Click play. Point to the network request:
     - **Status:** `206 Partial Content`
     - **Response Header:** `Content-Range: bytes 0-2097152/...`
     - **Response Header:** `Accept-Ranges: bytes`
   - Jump to the middle of the video. Show the examiner that a new chunk request is made starting from that exact byte offset!
   - Toggle **Theater Mode** to demonstrate responsive cinema layout.
4. **Demonstrate User Authentication & Role Restrictions:**
   - Click **Log In** in the top bar. Log in as `creator@example.com` / `password123`.
   - Show that the **Creator Studio** button appears in the navbar.
   - Navigate to `/upload`.
   - Drag and drop a sample `.mp4` file and select a thumbnail image. Click **Publish Stream**.
   - Point to the live upload progress bar. Show that on completion, it redirects to the new video's watch page displaying the uploaded thumbnail!
5. **Show Creator Dashboard & Analytics:**
   - Navigate to `/dashboard`.
   - Show the KPI cards (Total Uploads, Total Views, Storage Used).
   - Point to the category distribution table generated by the MongoDB `$facet` aggregation pipeline.
   - Show the inline metadata edit and delete functionality.
