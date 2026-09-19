// YouTube Public Data Service
// All YouTube API requests and keys are managed securely server-side via /api/youtube/videos

export interface YouTubeVideoItem {
  id: string;
  title: string;
  description: string;
  publishedAt: string;
  thumbnail: string;
  viewCount: number;
  duration: string;
}

export interface YouTubeChannelData {
  id: string;
  title: string;
  description: string;
  customUrl: string;
}

export const AMIDIA_CHANNEL_INFO: YouTubeChannelData = {
  id: "UC81LtJSjn6ZBwFadGUw57lw",
  title: "Amidia AI & Tech",
  description:
    "Videos on AI tools, automation, and developer workflows that help founders, engineers, and technical builders save time and scale.",
  customUrl: "@amidia-ai-tech",
};

export async function fetchPublicVideos(): Promise<YouTubeVideoItem[]> {
  try {
    const res = await fetch('/api/youtube/videos');
    if (!res.ok) {
      throw new Error(`Server returned status ${res.status}`);
    }
    const data = await res.json();
    if (data.videos && Array.isArray(data.videos) && data.videos.length > 0) {
      return data.videos;
    }
    return getFallbackVideos();
  } catch (err) {
    console.warn('Using client fallback videos:', err);
    return getFallbackVideos();
  }
}

// Backward compatibility helper for any existing callers
export async function fetchLiveAmidiaData(): Promise<{
  channel: YouTubeChannelData;
  videos: YouTubeVideoItem[];
}> {
  const videos = await fetchPublicVideos();
  return {
    channel: AMIDIA_CHANNEL_INFO,
    videos,
  };
}

function getFallbackVideos(): YouTubeVideoItem[] {
  return [
    {
      id: "jFjC7aGZ6bU",
      title: "I Built an Autonomous AI Agent in TypeScript (Full Breakdown)",
      description: "Hands-on guide building a persistent agentic tool-calling architecture with production guardrails.",
      publishedAt: "2026-02-15T12:00:00Z",
      thumbnail: "https://i.ytimg.com/vi/jFjC7aGZ6bU/hqdefault.jpg",
      viewCount: 42800,
      duration: "14:28",
    },
    {
      id: "vX9K3L5m8q0",
      title: "Stop Using Default Vector DBs: Production Search Systems",
      description: "Why standard embeddings fail in enterprise setups and how hybrid search with reranking solves it.",
      publishedAt: "2026-01-28T14:30:00Z",
      thumbnail: "https://i.ytimg.com/vi/vX9K3L5m8q0/hqdefault.jpg",
      viewCount: 31500,
      duration: "16:45",
    },
    {
      id: "zN1P4R7w9e2",
      title: "Building Production Developer Tools with React & Tailwind",
      description: "Step-by-step implementation of custom SDK tooling, telemetry logging, and modern developer UX.",
      publishedAt: "2026-01-10T10:15:00Z",
      thumbnail: "https://i.ytimg.com/vi/zN1P4R7w9e2/hqdefault.jpg",
      viewCount: 28900,
      duration: "12:10",
    },
  ];
}
