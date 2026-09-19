// Cloudflare Pages Function for GET /api/youtube/videos
// Mirrors the Express implementation in server.ts so the YouTube Data API
// call also works when the site is served as static Cloudflare Pages output
// (Pages does not execute server.ts/dist/server.cjs — only files under /functions).
//
// Configure YOUTUBE_API_KEY (and optionally YOUTUBE_PLAYLIST_ID) as
// environment variables in the Cloudflare Pages project settings for this
// to fetch live data. Without a key it serves the same fallback video list.

const FALLBACK_VIDEOS = [
  {
    id: 'jFjC7aGZ6bU',
    title: 'I Built an Autonomous AI Agent in TypeScript (Full Architecture)',
    description: 'Hands-on guide building a persistent agentic tool-calling architecture with production guardrails.',
    publishedAt: '2026-02-15T12:00:00Z',
    thumbnail: 'https://i.ytimg.com/vi/jFjC7aGZ6bU/hqdefault.jpg',
    viewCount: 42800,
    duration: '14:28',
  },
  {
    id: 'vX9K3L5m8q0',
    title: 'Stop Using Default Vector DBs: Production Search Systems',
    description: 'Why standard embeddings fail in enterprise setups and how hybrid search with reranking solves it.',
    publishedAt: '2026-01-28T14:30:00Z',
    thumbnail: 'https://i.ytimg.com/vi/vX9K3L5m8q0/hqdefault.jpg',
    viewCount: 31500,
    duration: '16:45',
  },
  {
    id: 'zN1P4R7w9e2',
    title: 'Building Production Developer Tools with React & Tailwind',
    description: 'Step-by-step implementation of custom SDK tooling, telemetry logging, and modern developer UX.',
    publishedAt: '2026-01-10T10:15:00Z',
    thumbnail: 'https://i.ytimg.com/vi/zN1P4R7w9e2/hqdefault.jpg',
    viewCount: 28900,
    duration: '12:10',
  },
];

const VIDEOS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours
let cachedYouTubeVideos: { videos: any[]; cachedAt: number } | null = null;

export const onRequestGet = async (context: any) => {
  const jsonResponse = (body: any) =>
    new Response(JSON.stringify(body), {
      headers: { 'content-type': 'application/json' },
    });

  try {
    const now = Date.now();
    if (cachedYouTubeVideos && now - cachedYouTubeVideos.cachedAt < VIDEOS_CACHE_TTL) {
      return jsonResponse({ success: true, cached: true, videos: cachedYouTubeVideos.videos });
    }

    const apiKey = context.env.YOUTUBE_API_KEY || '';
    const playlistId = context.env.YOUTUBE_PLAYLIST_ID || 'UU81LtJSjn6ZBwFadGUw57lw';

    if (!apiKey) {
      return jsonResponse({ success: true, cached: false, videos: FALLBACK_VIDEOS });
    }

    const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&key=${apiKey}&maxResults=20`;
    const playlistRes = await fetch(playlistUrl);
    const playlistJson: any = await playlistRes.json();

    let videos: any[] = [];
    if (playlistJson.items && playlistJson.items.length > 0) {
      const videoIds = playlistJson.items
        .map((p: any) => p.contentDetails?.videoId || p.snippet?.resourceId?.videoId)
        .filter(Boolean)
        .join(',');

      if (videoIds) {
        const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
        const detailsRes = await fetch(detailsUrl);
        const detailsJson: any = await detailsRes.json();

        if (detailsJson.items) {
          videos = detailsJson.items
            .filter((vid: any) => {
              if (vid.liveStreamingDetails) return false;
              if (vid.snippet?.liveBroadcastContent && vid.snippet.liveBroadcastContent !== 'none') return false;
              const title = (vid.snippet?.title || '').toLowerCase();
              if (title.includes('live stream') || title.includes('livestream')) return false;

              const match = (vid.contentDetails?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              const hrs = parseInt(match?.[1] || '0', 10);
              const mins = parseInt(match?.[2] || '0', 10);
              const secs = parseInt(match?.[3] || '0', 10);
              const totalSecs = hrs * 3600 + mins * 60 + secs;
              if (totalSecs > 0 && totalSecs <= 60) return false;
              return true;
            })
            .map((vid: any) => {
              const match = (vid.contentDetails?.duration || '').match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
              const hrs = parseInt(match?.[1] || '0', 10);
              const mins = parseInt(match?.[2] || '0', 10);
              const secs = parseInt(match?.[3] || '0', 10);
              const durationFormatted = hrs > 0
                ? `${hrs}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
                : `${mins}:${secs.toString().padStart(2, '0')}`;

              return {
                id: vid.id,
                title: vid.snippet.title,
                description: vid.snippet.description,
                publishedAt: vid.snippet.publishedAt,
                thumbnail:
                  vid.snippet.thumbnails?.maxres?.url ||
                  vid.snippet.thumbnails?.standard?.url ||
                  vid.snippet.thumbnails?.high?.url ||
                  vid.snippet.thumbnails?.medium?.url ||
                  `https://i.ytimg.com/vi/${vid.id}/hqdefault.jpg`,
                viewCount: Number(vid.statistics?.viewCount || 0),
                duration: durationFormatted,
              };
            });
        }
      }
    }

    if (videos.length > 0) {
      cachedYouTubeVideos = { videos, cachedAt: now };
      return jsonResponse({ success: true, cached: false, videos });
    }

    return jsonResponse({ success: true, cached: false, videos: FALLBACK_VIDEOS });
  } catch (err: any) {
    console.error('Failed to fetch YouTube videos:', err);
    return jsonResponse({ success: true, cached: false, videos: FALLBACK_VIDEOS });
  }
};
