import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { videoService } from '../services/videoService.js';
import { useAuth } from '../hooks/useAuth.js';
import { HeroSpotlight } from '../components/video/HeroSpotlight.jsx';
import { StreamCard } from '../components/video/StreamCard.jsx';
import { Pagination } from '../components/Pagination.jsx';
import { Spinner } from '../components/Spinner.jsx';
import { Alert } from '../components/Alert.jsx';
import { Radio, Film, Flame, Heart, Clock, LogIn, Compass } from 'lucide-react';

const CATEGORIES = ['All', 'Vlog', 'Sports', 'Movies', 'Tech', 'Music'];

const SORT_TABS = [
  { id: 'views', label: 'Most Viewed', icon: Flame },
  { id: 'popular', label: 'Popular', icon: Heart },
  { id: 'newest', label: 'Recently Uploaded', icon: Clock }
];

export const Home = () => {
  const { user, isAuthenticated } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [liveStreams, setLiveStreams] = useState([]);
  const [videos, setVideos] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalVideos: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const currentCategory = searchParams.get('category') || 'All';
  const currentSearch = searchParams.get('search') || '';
  const currentSort = searchParams.get('sort') || 'views';
  const currentPage = parseInt(searchParams.get('page'), 10) || 1;
  const isFollowingFilter = searchParams.get('filter') === 'following';

  // 1. Fetch live streams for hero carousel
  useEffect(() => {
    const fetchLiveStreams = async () => {
      try {
        const res = await videoService.getVideos({ isLive: true, limit: 10 });
        setLiveStreams(res.data.videos || []);
      } catch (err) {
        console.error('Failed to load live streams for hero carousel:', err);
      }
    };

    fetchLiveStreams();
  }, []);

  // 2. Fetch videos
  const fetchVideos = useCallback(async () => {
    // If on following tab and not logged in, or following nobody, no need to query backend
    if (isFollowingFilter && (!isAuthenticated || !user || !user.following || user.following.length === 0)) {
      setVideos([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const params = {
        page: currentPage,
        limit: isFollowingFilter ? 50 : 16,
        sort: currentSort,
        isLive: false // normal-length videos
      };

      if (currentCategory && currentCategory !== 'All') {
        params.category = currentCategory;
      }
      if (currentSearch) {
        params.search = currentSearch;
        delete params.isLive; // search across all videos
      }

      const res = await videoService.getVideos(params);
      let videoList = res.data.videos || [];

      // Filter by followed creators if Following tab is active
      if (isFollowingFilter && user && user.following && user.following.length > 0) {
        const followedIds = user.following.map((fid) =>
          (fid._id || fid.id || fid).toString()
        );
        videoList = videoList.filter((v) =>
          v.creator &&
          followedIds.includes((v.creator._id || v.creator.id || v.creator).toString())
        );
      }

      setVideos(videoList);
      setPagination(
        res.data.pagination || {
          currentPage: 1,
          totalPages: Math.ceil(videoList.length / 16) || 1,
          totalVideos: videoList.length
        }
      );
    } catch (err) {
      setError(err.message || 'Failed to load videos');
    } finally {
      setLoading(false);
    }
  }, [currentCategory, currentSearch, currentSort, currentPage, isFollowingFilter, user, isAuthenticated]);

  useEffect(() => {
    fetchVideos();
  }, [fetchVideos]);

  const handleSelectCategory = (category) => {
    const newParams = new URLSearchParams(searchParams);
    if (category === 'All') {
      newParams.delete('category');
    } else {
      newParams.set('category', category);
    }
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handleSelectSort = (sort) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('sort', sort);
    newParams.set('page', '1');
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Determine which live streams to highlight in the hero spotlight
  const followedLiveStreams = isFollowingFilter
    ? liveStreams.filter((s) => {
        const followedIds = (user?.following || []).map((fid) =>
          (fid._id || fid.id || fid).toString()
        );
        return s.creator && followedIds.includes((s.creator._id || s.creator.id || s.creator).toString());
      })
    : liveStreams;

  return (
    <div className="space-y-8 pb-12">
      {/* Search Alert Banner if active */}
      {currentSearch && (
        <div className="flex items-center justify-between p-3 bg-twitch-sidebar border border-twitch-border rounded-lg">
          <p className="text-xs text-twitch-text">
            Search results for <span className="font-bold text-twitch-purple">"{currentSearch}"</span>
          </p>
          <button
            onClick={() => setSearchParams({})}
            className="text-xs text-twitch-purple hover:underline font-semibold"
          >
            Clear Search
          </button>
        </div>
      )}

      {error && <Alert type="error" message={error} onClose={() => setError(null)} />}

      {/* Case 1: Unauthenticated user on Following tab */}
      {isFollowingFilter && !isAuthenticated ? (
        <div className="py-20 max-w-lg mx-auto text-center bg-twitch-card border border-twitch-border rounded-2xl p-8 sm:p-10 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-twitch-purple/20 border-2 border-twitch-purple/50 text-twitch-purple mx-auto flex items-center justify-center shadow-lg shadow-twitch-purple/20">
            <LogIn className="w-8 h-8 ml-0.5" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-twitch-text tracking-tight">
              You need to login first
            </h2>
            <p className="text-xs sm:text-sm text-twitch-muted max-w-sm mx-auto leading-relaxed">
              Sign in to your account to follow creators, watch their live streams, and see their latest videos right here in your personal Following feed.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-2">
            <Link
              to="/login"
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-twitch-purple hover:bg-twitch-purple-hover text-white transition shadow-lg shadow-twitch-purple/30"
            >
              Log In
            </Link>
            <Link
              to="/register"
              className="px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-[#18181B] hover:bg-twitch-border text-twitch-text border border-twitch-border transition"
            >
              Sign Up
            </Link>
          </div>
        </div>
      ) : isFollowingFilter && (!user?.following || user.following.length === 0) ? (
        /* Case 2: Logged-in user following nobody */
        <div className="py-20 max-w-lg mx-auto text-center bg-twitch-card border border-twitch-border rounded-2xl p-8 sm:p-10 space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-full bg-twitch-purple/20 border-2 border-twitch-purple/50 text-twitch-purple mx-auto flex items-center justify-center shadow-lg shadow-twitch-purple/20">
            <Heart className="w-8 h-8 text-twitch-purple" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-twitch-text tracking-tight">
              You follow nobody
            </h2>
            <p className="text-xs sm:text-sm text-twitch-muted max-w-sm mx-auto leading-relaxed">
              Channels and creators you follow will appear here. Browse channels and click the Follow button on any stream to add them to your following feed!
            </p>
          </div>
          <div className="pt-2">
            <Link
              to="/"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold uppercase tracking-wider bg-twitch-purple hover:bg-twitch-purple-hover text-white transition shadow-lg shadow-twitch-purple/30"
            >
              <Compass className="w-4 h-4" />
              <span>Browse Channels</span>
            </Link>
          </div>
        </div>
      ) : (
        /* Case 3: Browse Directory OR Followed Channels with content */
        <>
          {/* Top Hero Spotlight Carousel */}
          {!currentSearch && followedLiveStreams.length > 0 && (
            <HeroSpotlight liveStreams={followedLiveStreams} />
          )}

          {/* Video Feed Section */}
          <div className="space-y-4">
            {/* Category Pills & Sorting Bar */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-twitch-border pb-3">
              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto max-w-full pb-1 sm:pb-0 scrollbar-none">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => handleSelectCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition whitespace-nowrap ${
                      currentCategory === cat
                        ? 'bg-twitch-purple text-white shadow-md shadow-twitch-purple/20'
                        : 'bg-twitch-card hover:bg-twitch-border text-twitch-muted hover:text-twitch-text border border-twitch-border'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Interactive Sort Tabs */}
              <div className="flex items-center gap-1 self-end sm:self-auto shrink-0 bg-[#18181B] p-1 rounded-lg border border-twitch-border">
                <span className="text-[11px] text-twitch-muted font-bold uppercase tracking-wider px-1.5 hidden md:inline">
                  Sort:
                </span>
                {SORT_TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = currentSort === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => handleSelectSort(tab.id)}
                      className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-bold transition ${
                        isActive
                          ? 'bg-twitch-purple text-white shadow-sm shadow-twitch-purple/30'
                          : 'text-twitch-muted hover:text-twitch-text hover:bg-twitch-card'
                      }`}
                      title={`Sort by ${tab.label}`}
                    >
                      <Icon
                        className={`w-3.5 h-3.5 ${
                          isActive
                            ? 'text-white'
                            : tab.id === 'popular'
                            ? 'text-rose-400'
                            : tab.id === 'views'
                            ? 'text-amber-400'
                            : 'text-twitch-muted'
                        }`}
                      />
                      <span>{tab.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section Heading */}
            <div className="flex items-center gap-2 pt-1">
              {isFollowingFilter ? (
                <Heart className="w-4 h-4 text-twitch-purple fill-current" />
              ) : (
                <Film className="w-4 h-4 text-twitch-purple" />
              )}
              <h2 className="text-sm font-extrabold text-twitch-text tracking-tight uppercase">
                {isFollowingFilter
                  ? `Followed Channels & Videos (${videos.length})`
                  : currentCategory === 'All'
                  ? 'Recommended Videos'
                  : `${currentCategory} Videos`}
              </h2>
            </div>

            {/* Video Grid */}
            {loading ? (
              <div className="py-20">
                <Spinner size="lg" />
              </div>
            ) : videos.length === 0 ? (
              <div className="py-16 text-center bg-twitch-card/40 rounded-xl border border-twitch-border p-6 space-y-3">
                <Radio className="w-10 h-10 text-twitch-muted mx-auto" />
                <h3 className="text-sm font-bold text-twitch-text">No videos match filter</h3>
                <p className="text-xs text-twitch-muted max-w-sm mx-auto">
                  {isFollowingFilter
                    ? `None of your followed creators have videos in '${currentCategory}'. Try selecting 'All' or clearing search.`
                    : 'No videos match your current filter. Try selecting another category or clearing search.'}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {videos.map((video, index) => (
                  <StreamCard key={video._id} video={video} index={index} />
                ))}
              </div>
            )}

            {/* Pagination */}
            {videos.length > 0 && (
              <Pagination
                currentPage={pagination.currentPage}
                totalPages={pagination.totalPages}
                onPageChange={handlePageChange}
              />
            )}
          </div>
        </>
      )}
    </div>
  );
};
