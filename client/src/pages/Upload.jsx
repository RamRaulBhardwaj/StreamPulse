import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadCloud, Film, Image as ImageIcon, Video } from 'lucide-react';
import { videoService } from '../services/videoService.js';
import { ProgressBar } from '../components/ProgressBar.jsx';
import { Alert } from '../components/Alert.jsx';

const categories = ['Gaming', 'Just Chatting', 'Coding', 'Music', 'IRL', 'Tech', 'Education', 'Other'];

export const Upload = () => {
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('Gaming');
  const [tags, setTags] = useState('');
  const [videoFile, setVideoFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState(null);

  const [uploadProgress, setUploadProgress] = useState(0);
  const [loadedBytes, setLoadedBytes] = useState(0);
  const [totalBytes, setTotalBytes] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState(null);

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.type !== 'video/mp4' && !file.name.endsWith('.mp4')) {
      setError('Only .mp4 video files are accepted for streaming');
      return;
    }

    if (file.size > 200 * 1024 * 1024) {
      setError('Video file exceeds maximum limit of 200MB');
      return;
    }

    setError(null);
    setVideoFile(file);
    if (!title) {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
      setTitle(cleanTitle.charAt(0).toUpperCase() + cleanTitle.slice(1));
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Thumbnail must be a JPEG, PNG, or WebP image');
      return;
    }

    setError(null);
    setThumbnailFile(file);
    setThumbnailPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!videoFile) {
      setError('Please select an MP4 video file to upload');
      return;
    }
    if (!title.trim()) {
      setError('Stream title cannot be empty');
      return;
    }

    const formData = new FormData();
    formData.append('video', videoFile);
    if (thumbnailFile) {
      formData.append('thumbnail', thumbnailFile);
    }
    formData.append('title', title.trim());
    formData.append('description', description.trim());
    formData.append('category', category);
    formData.append('tags', tags.trim());

    setIsUploading(true);
    setError(null);

    try {
      const res = await videoService.uploadVideo(formData, (percent, loaded, total) => {
        setUploadProgress(percent);
        setLoadedBytes(loaded);
        setTotalBytes(total);
      });

      const newVideo = res.data;
      navigate(`/watch/${newVideo._id}`);
    } catch (err) {
      setError(err.message || 'Failed to publish stream');
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 py-4">
      {/* Studio Header */}
      <div className="border-b border-twitch-border pb-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-twitch-text tracking-tight flex items-center gap-2">
            <Video className="w-6 h-6 text-twitch-purple" />
            <span>Creator Studio — Upload Stream</span>
          </h1>
          <p className="text-xs text-twitch-muted mt-1">
            Publish MP4 content for direct Node.js HTTP 206 Partial Content byte-range streaming.
          </p>
        </div>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Video File Drag-and-Drop Zone */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
            Video Source (.mp4) *
          </label>
          <div className="border-2 border-dashed border-twitch-border hover:border-twitch-purple rounded-xl p-6 text-center transition bg-twitch-card/60 cursor-pointer relative group">
            <input
              type="file"
              accept="video/mp4"
              onChange={handleVideoChange}
              disabled={isUploading}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <div className="flex flex-col items-center pointer-events-none">
              <Film className="w-10 h-10 text-twitch-purple mb-2 group-hover:scale-110 transition" />
              {videoFile ? (
                <div className="text-sm font-bold text-twitch-text">
                  {videoFile.name}
                  <span className="text-xs text-twitch-muted ml-2">
                    ({(videoFile.size / (1024 * 1024)).toFixed(1)} MB)
                  </span>
                </div>
              ) : (
                <>
                  <p className="text-sm font-semibold text-twitch-text">
                    Drag and drop your MP4 video here, or browse files
                  </p>
                  <p className="text-xs text-twitch-muted mt-1">MP4 format only, up to 200MB</p>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Thumbnail Selector */}
        <div className="space-y-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-twitch-text">
            Cover / Thumbnail (Optional)
          </label>
          <div className="flex items-center gap-4">
            <div className="w-32 aspect-video bg-twitch-card border border-twitch-border rounded-lg overflow-hidden flex items-center justify-center shrink-0">
              {thumbnailPreview ? (
                <img
                  src={thumbnailPreview}
                  alt="Cover preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <ImageIcon className="w-6 h-6 text-twitch-muted" />
              )}
            </div>
            <div className="flex-1">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleThumbnailChange}
                disabled={isUploading}
                className="block w-full text-xs text-twitch-muted file:mr-3 file:py-1.5 file:px-3 file:rounded file:border-0 file:text-xs file:font-bold file:bg-twitch-card file:text-twitch-text hover:file:bg-twitch-border cursor-pointer"
              />
              <p className="text-[11px] text-twitch-muted mt-1">JPEG, PNG, or WebP up to 5MB</p>
            </div>
          </div>
        </div>

        {/* Title */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-twitch-text">Stream Title *</label>
          <input
            type="text"
            required
            maxLength={120}
            placeholder="e.g., 🔴 [LIVE] High-Rank Speedruns & Chill Coding"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={isUploading}
            className="w-full bg-[#18181B] border border-twitch-border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none focus:border-twitch-purple"
          />
        </div>

        {/* Category & Tags Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-twitch-text">Category *</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              disabled={isUploading}
              className="w-full bg-[#18181B] border border-twitch-border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text focus:outline-none focus:border-twitch-purple cursor-pointer"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-twitch-text">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              placeholder="gaming, chill, live, english"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              disabled={isUploading}
              className="w-full bg-[#18181B] border border-twitch-border rounded px-3 py-2 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none focus:border-twitch-purple"
            />
          </div>
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <label className="block text-xs font-bold text-twitch-text">Broadcast Description</label>
          <textarea
            rows="4"
            maxLength={2000}
            placeholder="Describe what you are streaming today..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            disabled={isUploading}
            className="w-full bg-[#18181B] border border-twitch-border rounded p-3 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none focus:border-twitch-purple resize-none"
          />
        </div>

        {/* Twitch-Purple Live Upload Progress Bar */}
        {isUploading && (
          <div className="p-4 bg-twitch-card rounded-lg border border-twitch-border space-y-2">
            <ProgressBar progress={uploadProgress} loaded={loadedBytes} total={totalBytes} />
          </div>
        )}

        {/* Submit Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={isUploading}
            className="flex items-center gap-2 px-6 py-2.5 rounded font-bold text-xs uppercase tracking-wider bg-twitch-purple hover:bg-twitch-purple-hover text-white disabled:opacity-50 transition shadow-lg shadow-twitch-purple/20"
          >
            <UploadCloud className="w-4 h-4" />
            <span>{isUploading ? 'Streaming to Server...' : 'Go Live / Publish'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
