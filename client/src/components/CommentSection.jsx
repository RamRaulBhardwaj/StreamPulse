import { useState, useEffect, useCallback } from 'react';
import { Trash2, MessageSquare, Send } from 'lucide-react';
import { useAuth } from '../hooks/useAuth.js';
import { commentService } from '../services/commentService.js';
import { Spinner } from './Spinner.jsx';
import { Alert } from './Alert.jsx';

export const CommentSection = ({ videoId }) => {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    try {
      const response = await commentService.getComments(videoId);
      setComments(response.data.comments || []);
    } catch (err) {
      setError(err.message || 'Failed to load comments');
    } finally {
      setLoading(false);
    }
  }, [videoId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim() || submitting) return;

    setSubmitting(true);
    setError(null);
    try {
      const response = await commentService.createComment(videoId, content.trim());
      setComments((prev) => [response.data, ...prev]);
      setContent('');
    } catch (err) {
      setError(err.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;

    try {
      await commentService.deleteComment(commentId);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
    } catch (err) {
      setError(err.message || 'Failed to delete comment');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="space-y-6 pt-6 border-t border-twitch-border">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm sm:text-base font-bold text-twitch-text">
        <MessageSquare className="w-5 h-5 text-twitch-purple" />
        <span>Comments ({comments.length})</span>
      </div>

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Add Comment Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3 items-start">
          <img
            src={
              user.avatar ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(user.name)}`
            }
            alt={user.name}
            className="w-10 h-10 rounded-full object-cover border border-twitch-border bg-twitch-card shrink-0"
          />
          <div className="flex-1 space-y-2">
            <textarea
              rows="2"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Add a comment to this video..."
              className="w-full bg-[#18181B] border border-twitch-border rounded-lg p-3 text-xs sm:text-sm text-twitch-text placeholder-twitch-muted focus:outline-none focus:border-twitch-purple focus:ring-1 focus:ring-twitch-purple transition resize-none"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={submitting || !content.trim()}
                className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded bg-twitch-purple hover:bg-twitch-purple-hover text-white disabled:opacity-40 disabled:cursor-not-allowed transition shadow"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{submitting ? 'Posting...' : 'Comment'}</span>
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="p-4 bg-twitch-card rounded-lg border border-twitch-border text-center text-xs text-twitch-muted">
          Please log in to join the discussion and post comments.
        </div>
      )}

      {/* Comment List */}
      {loading ? (
        <Spinner size="md" />
      ) : comments.length === 0 ? (
        <div className="text-center py-8 text-xs text-twitch-muted">
          No comments yet. Be the first to share your thoughts!
        </div>
      ) : (
        <div className="space-y-4">
          {comments.map((comment) => {
            const currentUserId = user?._id || user?.id;
            const commentUserId = comment.user?._id || comment.user?.id;
            const isAuthor = Boolean(
              currentUserId &&
              commentUserId &&
              String(currentUserId) === String(commentUserId)
            );
            const isAdmin = user && user.role === 'admin';
            const canDelete = isAuthor || isAdmin;

            return (
              <div
                key={comment._id}
                className="flex gap-3 group p-2.5 rounded-lg hover:bg-twitch-card/60 transition"
              >
                <img
                  src={
                    comment.user?.avatar ||
                    `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(comment.user?.name || 'User')}`
                  }
                  alt={comment.user?.name || 'User'}
                  className="w-9 h-9 rounded-full object-cover border border-twitch-border bg-twitch-card shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      {/* Plain Channel Name - No Badges! */}
                      <span className="text-xs font-bold text-twitch-text">
                        {comment.user?.name || 'User'}
                      </span>
                      <span className="text-[11px] text-twitch-muted">
                        {formatDate(comment.createdAt)}
                      </span>
                    </div>

                    {canDelete && (
                      <button
                        onClick={() => handleDelete(comment._id)}
                        className="text-twitch-muted hover:text-rose-400 opacity-0 group-hover:opacity-100 transition p-1"
                        title="Delete comment"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-twitch-text mt-1 whitespace-pre-wrap leading-relaxed">
                    {comment.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
