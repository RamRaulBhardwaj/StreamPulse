import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { BarChart3, Film, Eye, HardDrive, Trash2, Edit2, Play, Plus } from 'lucide-react';
import { videoService } from '../services/videoService.js';
import { useAuth } from '../hooks/useAuth.js';
import { Spinner } from '../components/Spinner.jsx';
import { Alert } from '../components/Alert.jsx';
import { getThumbnailUrl, handleThumbnailError } from '../utils/thumbnailUtils.js';

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [myVideos, setMyVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionSuccess, setActionSuccess] = useState(null);

  // Edit modal state
  const [editingVideo, setEditingVideo] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('');

  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Fetch Aggregation Pipeline Statistics (Unit 5 requirement)
      const statsRes = await videoService.getVideoStats();
      setStats(statsRes.data);

      // 2. Fetch Creator's own broadcasts
      const myVideosRes = await videoService.getVideos({
        creator: user.id || user._id,
        limit: 50
      });
      setMyVideos(myVideosRes.data.videos || []);
    } catch (err) {
      setError(err.message || 'Failed to load creator dashboard analytics');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const handleDeleteVideo = async (id, title) => {
    if (!window.confirm(`Are you sure you want to permanently delete "${title}"?`)) return;

    try {
      await videoService.deleteVideo(id);
      setActionSuccess(`Broadcast "${title}" was deleted along with its files and comments.`);
      setMyVideos((prev) => prev.filter((v) => v._id !== id));
      // Refresh stats
      const statsRes = await videoService.getVideoStats();
      setStats(statsRes.data);
    } catch (err) {
      setError(err.message || 'Failed to delete broadcast');
    }
  };

  const handleOpenEdit = (v) => {
    setEditingVideo(v);
    setEditTitle(v.title);
    setEditCategory(v.category);
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    if (!editingVideo) return;

    try {
      const res = await videoService.updateVideo(editingVideo._id, {
        title: editTitle,
        category: editCategory
      });
      setMyVideos((prev) =>
        prev.map((v) => (v._id === editingVideo._id ? res.data : v))
      );
      setEditingVideo(null);
      setActionSuccess('Broadcast metadata updated successfully');
    } catch (err) {
      setError(err.message || 'Failed to update broadcast');
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  const overview = stats?.overview?.[0] || {
    totalPlatformVideos: 0,
    totalPlatformViews: 0,
    totalPlatformBytes: 0
  };
  const categoryBreakdown = stats?.categoryBreakdown || [];

  return (
    <div className="space-y-8 py-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-twitch-border pb-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-twitch-text tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-twitch-purple" />
            <span>Twitch Creator Dashboard</span>
          </h1>
          <p className="text-xs text-twitch-muted mt-1">
            Real-time analytics and stream management powered by MongoDB .aggregate() pipeline.
          </p>
        </div>
        <Link
          to="/upload"
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold uppercase tracking-wider rounded bg-twitch-purple hover:bg-twitch-purple-hover text-white transition shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Upload New Stream</span>
        </Link>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}
      {actionSuccess && (
        <Alert type="success" message={actionSuccess} onClose={() => setActionSuccess(null)} />
      )}

      {/* Overview Analytics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-twitch-card border border-twitch-border rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-twitch-purple/10 border border-twitch-purple/30 text-twitch-purple flex items-center justify-center">
            <Film className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {overview.totalPlatformVideos || 0}
            </div>
            <div className="text-xs text-twitch-muted font-medium">Total Platform Broadcasts</div>
          </div>
        </div>

        <div className="p-4 bg-twitch-card border border-twitch-border rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {(overview.totalPlatformViews || 0).toLocaleString()}
            </div>
            <div className="text-xs text-twitch-muted font-medium">Total Stream Views</div>
          </div>
        </div>

        <div className="p-4 bg-twitch-card border border-twitch-border rounded-lg flex items-center gap-4">
          <div className="w-12 h-12 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center justify-center">
            <HardDrive className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-white">
              {((overview.totalPlatformBytes || 0) / (1024 * 1024)).toFixed(1)} MB
            </div>
            <div className="text-xs text-twitch-muted font-medium">Video Data Streamed</div>
          </div>
        </div>
      </div>

      {/* Category Breakdown (Mongoose Aggregation Pipeline Display) */}
      <div className="p-4 bg-twitch-card border border-twitch-border rounded-lg space-y-3">
        <h2 className="text-xs font-bold uppercase tracking-wider text-twitch-muted">
          Category Distribution (Mongoose $facet & $group Aggregation)
        </h2>
        {categoryBreakdown.length === 0 ? (
          <div className="text-xs text-twitch-muted">No category data aggregated yet.</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categoryBreakdown.map((cat) => (
              <div
                key={cat._id}
                className="p-3 bg-twitch-sidebar border border-twitch-border rounded"
              >
                <div className="text-xs font-bold text-twitch-purple">{cat._id}</div>
                <div className="text-lg font-black text-white mt-1">{cat.videoCount} streams</div>
                <div className="text-[11px] text-twitch-muted">{cat.totalViews} views</div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* My Broadcasts Table */}
      <div className="space-y-3">
        <h2 className="text-sm font-bold uppercase tracking-wider text-twitch-text">
          My Uploaded Streams ({myVideos.length})
        </h2>

        {myVideos.length === 0 ? (
          <div className="p-8 bg-twitch-card border border-twitch-border rounded-lg text-center space-y-2">
            <p className="text-xs text-twitch-muted">You have not uploaded any streams yet.</p>
            <Link
              to="/upload"
              className="inline-block px-4 py-1.5 rounded font-bold text-xs bg-twitch-purple text-white hover:bg-twitch-purple-hover"
            >
              Upload First Broadcast
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-lg border border-twitch-border">
            <table className="w-full text-left text-xs text-twitch-text bg-twitch-card">
              <thead className="bg-twitch-sidebar text-twitch-muted uppercase font-bold text-[10px] tracking-wider border-b border-twitch-border">
                <tr>
                  <th className="px-4 py-3">Stream</th>
                  <th className="px-4 py-3">Category</th>
                  <th className="px-4 py-3">Views</th>
                  <th className="px-4 py-3">Likes</th>
                  <th className="px-4 py-3">File Size</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-twitch-border">
                {myVideos.map((video) => (
                  <tr key={video._id} className="hover:bg-twitch-sidebar/80 transition">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-14 aspect-video bg-black rounded overflow-hidden shrink-0">
                          <img
                            src={getThumbnailUrl(video)}
                            alt={video.title}
                            onError={handleThumbnailError}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="font-semibold text-white truncate max-w-xs block">
                          {video.title}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded bg-twitch-sidebar text-twitch-purple font-bold">
                        {video.category}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-semibold text-[#FF8280]">{video.views}</td>
                    <td className="px-4 py-3">{video.likesCount || (video.likes ? video.likes.length : 0)}</td>
                    <td className="px-4 py-3">
                      {((video.size || 0) / (1024 * 1024)).toFixed(1)} MB
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          to={`/watch/${video._id}`}
                          className="p-1.5 hover:text-twitch-purple hover:bg-twitch-sidebar rounded transition"
                          title="Watch Stream"
                        >
                          <Play className="w-4 h-4" />
                        </Link>
                        <button
                          onClick={() => handleOpenEdit(video)}
                          className="p-1.5 hover:text-sky-400 hover:bg-twitch-sidebar rounded transition"
                          title="Edit Details"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteVideo(video._id, video.title)}
                          className="p-1.5 hover:text-rose-400 hover:bg-twitch-sidebar rounded transition"
                          title="Delete Stream"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Edit Video Modal */}
      {editingVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-twitch-card border border-twitch-border rounded-xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold uppercase tracking-wider text-twitch-text">
              Edit Stream Details
            </h3>
            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-bold text-twitch-text">Title</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-[#18181B] border border-twitch-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-twitch-purple"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-twitch-text">Category</label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value)}
                  className="w-full bg-[#18181B] border border-twitch-border rounded px-3 py-2 text-xs text-white focus:outline-none focus:border-twitch-purple cursor-pointer"
                >
                  {['Gaming', 'Just Chatting', 'Coding', 'Music', 'IRL', 'Tech', 'Education', 'Other'].map(
                    (cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    )
                  )}
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingVideo(null)}
                  className="px-3 py-1.5 text-xs font-semibold rounded text-twitch-muted hover:text-white hover:bg-twitch-sidebar"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold rounded bg-twitch-purple hover:bg-twitch-purple-hover text-white"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
