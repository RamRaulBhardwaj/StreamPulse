import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Heart, Eye, Tag, Edit, Trash2, Check, UserPlus } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth.js';
import { authService } from '../../services/authService.js';

export const ChannelHeader = ({
  video,
  isLiked,
  likesCount,
  onToggleLike,
  onDeleteVideo
}) => {
  const { user, isAuthenticated, updateFollowing } = useAuth();
  const creator = video.creator;

  const [isFollowing, setIsFollowing] = useState(
    user && user.following && creator
      ? user.following.some(
          (fid) =>
            (fid._id || fid.id || fid).toString() ===
            (creator._id || creator.id || creator).toString()
        )
      : false
  );
  const [followersCount, setFollowersCount] = useState(
    creator?.followers ? creator.followers.length : 142
  );
  const [followLoading, setFollowLoading] = useState(false);

  const handleToggleFollow = async () => {
    if (!isAuthenticated) {
      alert('Please sign in to follow this channel');
      return;
    }
    if (!creator) return;

    setFollowLoading(true);
    try {
      const creatorId = creator._id || creator.id;
      const res = await authService.toggleFollow(creatorId);
      const nextState = res.data.isFollowing;
      setIsFollowing(nextState);
      setFollowersCount(res.data.followersCount);
      if (updateFollowing) {
        updateFollowing(creator, nextState);
      }
    } catch (err) {
      alert(err.message || 'Failed to update follow status');
    } finally {
      setFollowLoading(false);
    }
  };

  const isOwnerOrAdmin =
    user &&
    user.role !== 'viewer' &&
    ((user.role === 'creator' &&
      creator &&
      (user.id === (creator._id || creator.id) ||
        user._id === (creator._id || creator.id))) ||
      user.role === 'admin');

  return (
    <div className="space-y-4 pt-1">
      {/* Top Row: Stream Title, Category & Viewer Stats */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        {/* Creator Channel Bar: Avatar & Plain Name Only */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <img
              src={
                creator?.avatar ||
                `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(creator?.name || 'Channel')}`
              }
              alt={creator?.name}
              className="w-12 h-12 rounded-full border-2 border-twitch-purple object-cover bg-twitch-card"
            />
            {video.isLive && (
              <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-twitch-live border-2 border-twitch-sidebar" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2">
              {/* Plain Channel Name - No Badges! */}
              <h2 className="text-sm sm:text-base font-extrabold text-twitch-text hover:text-twitch-purple transition leading-tight">
                {creator?.name || 'Anonymous Creator'}
              </h2>
            </div>

            <div className="flex items-center gap-2 text-xs text-twitch-muted mt-0.5">
              <Link
                to={`/?category=${encodeURIComponent(video.category)}`}
                className="text-twitch-purple hover:underline font-semibold"
              >
                {video.category}
              </Link>
              <span>•</span>
              <span>{followersCount} followers</span>
            </div>
          </div>
        </div>

        {/* Action Buttons: Follow, Like, Views, Edit/Delete */}
        <div className="flex items-center gap-2 self-stretch sm:self-auto justify-end flex-wrap">
          {/* Follow Button */}
          {user && (user.id === creator?._id || user._id === creator?._id) ? null : (
            <button
              onClick={handleToggleFollow}
              disabled={followLoading}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold transition shadow ${
                isFollowing
                  ? 'bg-twitch-card hover:bg-twitch-border text-twitch-text border border-twitch-border'
                  : 'bg-twitch-purple hover:bg-twitch-purple-hover text-white'
              }`}
            >
              {isFollowing ? (
                <>
                  <Check className="w-3.5 h-3.5 text-twitch-purple" />
                  <span>Following</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-3.5 h-3.5" />
                  <span>Follow</span>
                </>
              )}
            </button>
          )}

          {/* Like Button */}
          <button
            onClick={onToggleLike}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold border transition ${
              isLiked
                ? 'bg-twitch-card border-twitch-purple text-twitch-purple'
                : 'bg-twitch-card hover:bg-twitch-border border-twitch-border text-twitch-text'
            }`}
            title="Like this video"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isLiked ? 'fill-current text-twitch-purple' : ''}`}
            />
            <span>{likesCount}</span>
          </button>

          {/* View Count in #FF8280 */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-twitch-card border border-twitch-border text-xs font-bold text-[#FF8280]">
            <Eye className="w-3.5 h-3.5 text-twitch-live" />
            <span>{video.views || 0}</span>
          </div>

          {/* Owner Moderation Controls */}
          {isOwnerOrAdmin && (
            <div className="flex items-center gap-1 border-l border-twitch-border pl-2">
              <Link
                to={`/dashboard`}
                className="p-1.5 rounded bg-twitch-card hover:bg-twitch-border text-twitch-muted hover:text-white transition"
                title="Edit in Dashboard"
              >
                <Edit className="w-3.5 h-3.5" />
              </Link>
              <button
                onClick={onDeleteVideo}
                className="p-1.5 rounded bg-twitch-card hover:bg-rose-950/60 text-rose-400 transition"
                title="Delete Video"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Video Title & Tag Pills */}
      <div className="space-y-2 border-t border-twitch-border/60 pt-3">
        <h1 className="text-base sm:text-lg font-bold text-twitch-text leading-snug">
          {video.title}
        </h1>

        {video.tags && video.tags.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Tag className="w-3 h-3 text-twitch-muted" />
            {video.tags.map((tag, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-twitch-card text-twitch-muted border border-twitch-border"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
