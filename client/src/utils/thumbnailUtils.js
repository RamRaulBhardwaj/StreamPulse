/**
 * Thumbnail URL & Fallback Resolution Utility
 * 
 * Guarantees zero broken images across:
 * 1. Generated 16:9 carousel thumbnails (/client/public/thumbnails/live-1.png .. live-5.png)
 * 2. Real downloaded stock thumbnails (/client/public/thumbnails/video-1.jpg .. video-20.jpg)
 * 3. User uploaded thumbnails from Multer (/server/uploads/thumbnails/)
 * 4. Deterministic remote seed URLs (https://picsum.photos/seed/{slug}/640/360)
 * 5. Safe local fallback default (/client/public/thumbnails/default-thumbnail.jpg)
 */

export const getThumbnailUrl = (video, index = 0) => {
  if (!video) return '/thumbnails/default-thumbnail.jpg';

  const raw = video.thumbnailFileName;
  if (raw && typeof raw === 'string' && raw.trim() !== '') {
    // 1. External absolute URLs
    if (raw.startsWith('http://') || raw.startsWith('https://')) {
      return raw;
    }

    // 2. Already rooted paths (e.g., /thumbnails/live-1.png or /uploads/thumbnails/...)
    if (raw.startsWith('/')) {
      return raw;
    }

    // 3. Local public thumbnail assets (live-1.png, video-1.jpg, default-thumbnail.jpg)
    if (raw.startsWith('live-') || raw.startsWith('video-') || raw.startsWith('default-')) {
      return `/thumbnails/${raw}`;
    }

    // 4. Uploaded thumbnails from Multer stored in server/uploads/thumbnails/
    return `/uploads/thumbnails/${raw}`;
  }

  // Live stream fallback: deterministic index mapped to live-1.png ... live-5.png
  if (video.isLive) {
    const liveNum = (index % 5) + 1;
    return `/thumbnails/live-${liveNum}.png`;
  }

  // Normal-length video: map index to local video stock thumbnail video-1.jpg ... video-20.jpg
  const videoNum = (index % 20) + 1;
  return `/thumbnails/video-${videoNum}.jpg`;
};

/**
 * Universal onError handler for all thumbnail <img> elements.
 * Prevents recursive loops and gracefully falls back to local default thumbnail.
 */
export const handleThumbnailError = (e) => {
  if (e?.currentTarget) {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/thumbnails/default-thumbnail.jpg';
  }
};
