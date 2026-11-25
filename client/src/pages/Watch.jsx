import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { videoService } from '../services/videoService.js';
import { useAuth } from '../hooks/useAuth.js';
import { TwitchPlayer } from '../components/video/TwitchPlayer.jsx';
import { ChannelHeader } from '../components/video/ChannelHeader.jsx';
import { CommentSection } from '../components/CommentSection.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { Alert } from '../components/Alert.jsx';
import { getThumbnailUrl } from '../utils/thumbnailUtils.js';

export const Watch = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isAuthenticated } = useAuth();

  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isLiked, setIsLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(0);
  const [isTheaterMode, setIsTheaterMode] = useState(false);

  useEffect(() => {
    const fetchVideoDetails = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await videoService.getVideoById(id);
        const data = res.data;
        setVideo(data);
        setLikesCount(data.likesCount || (data.likes ? data.likes.length : 0));

        if (user && data.likes) {
          const hasLiked = data.likes.some(
            (uid) => uid === user.id || uid._id === user.id || uid === user._id
          );
          setIsLiked(hasLiked);
        }
      } catch (err) {
        setError(err.message || 'Failed to load video stream');
      } finally {
        setLoading(false);
      }
    };

    fetchVideoDetails();
  }, [id, user]);

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to like this video.');
      return;
    }

    try {
      const res = await videoService.toggleLike(id);
      setIsLiked(res.data.isLiked);
      setLikesCount(res.data.likesCount);
    } catch (err) {
      alert(err.message || 'Could not update like status');
    }
  };

  const handleDeleteVideo = async () => {
    if (!user || user.role === 'viewer') {
      alert('Viewers do not have permission to delete videos.');
      return;
    }
    if (!window.confirm('Are you sure you want to delete this video?')) return;

    try {
      await videoService.deleteVideo(id);
      navigate('/');
    } catch (err) {
      alert(err.message || 'Failed to delete video');
    }
  };

  if (loading) {
    return (
      <div className="py-24">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !video) {
    return (
      <div className="max-w-2xl mx-auto py-16 p-4">
        <Alert type="error" message={error || 'Video not found'} />
      </div>
    );
  }

  const posterUrl = getThumbnailUrl(video);

  return (
    <div className={`w-full mx-auto space-y-6 pb-12 ${isTheaterMode ? 'max-w-full' : 'max-w-5xl'}`}>
      {/* 16:9 Cinema Video Player (HTTP 206 Partial Content Stream) */}
      <TwitchPlayer
        videoId={video._id}
        posterUrl={posterUrl}
        isTheaterMode={isTheaterMode}
        onToggleTheater={() => setIsTheaterMode((prev) => !prev)}
      />

      {/* Channel Header (Avatar + Plain Channel Name + Actions) */}
      <ChannelHeader
        video={video}
        isLiked={isLiked}
        likesCount={likesCount}
        onToggleLike={handleToggleLike}
        onDeleteVideo={handleDeleteVideo}
      />

      {/* Video Description Box */}
      <div className="p-4 bg-twitch-card border border-twitch-border rounded-lg space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-twitch-muted">
          About {video.creator?.name || 'this video'}
        </h3>
        <p className="text-xs sm:text-sm text-twitch-text whitespace-pre-wrap leading-relaxed">
          {video.description || 'Welcome to the video! Enjoy high-performance streaming powered by Node.js fs streams & HTTP 206 Partial Content.'}
        </p>
      </div>

      {/* Standard Below-the-Video Comments Section (No Live Chat Panel) */}
      <CommentSection videoId={video._id} />
    </div>
  );
};
