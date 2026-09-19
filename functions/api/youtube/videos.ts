import { jsonResponse } from '../../_shared/helpers';
import { FALLBACK_VIDEOS } from '../../_shared/constants';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const apiKey = (context.env as any).YOUTUBE_API_KEY || '';
    const playlistId = (context.env as any).YOUTUBE_PLAYLIST_ID || 'UU81LtJSjn6ZBwFadGUw57lw';

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
      return jsonResponse({ success: true, cached: false, videos });
    }

    return jsonResponse({ success: true, cached: false, videos: FALLBACK_VIDEOS });
  } catch (err: any) {
    return jsonResponse({ success: true, cached: false, videos: FALLBACK_VIDEOS });
  }
};
