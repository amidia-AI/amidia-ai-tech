import dotenv from 'dotenv';
dotenv.config();

import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import { initializeApp, getApps } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import sanitizeHtml from 'sanitize-html';

// Initialize Firebase Admin & Firestore
let firestoreDbId: string | undefined = undefined;
let firebaseConfig: any = null;
try {
  const configPath = path.join(process.cwd(), 'firebase-applet-config.json');
  const publicConfigPath = path.join(process.cwd(), 'public/firebase-applet-config.json');
  if (fs.existsSync(configPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  } else if (fs.existsSync(publicConfigPath)) {
    firebaseConfig = JSON.parse(fs.readFileSync(publicConfigPath, 'utf8'));
  }

  if (firebaseConfig?.firestoreDatabaseId) {
    firestoreDbId = firebaseConfig.firestoreDatabaseId;
  }

  // Only initialise firebase-admin when Google Application Default Credentials can
  // realistically be resolved. Without them every Firestore call rejects asynchronously,
  // which previously crashed the process instead of falling back to local JSON storage.
  const hasGoogleCredentials = Boolean(
    process.env.GOOGLE_APPLICATION_CREDENTIALS ||
    process.env.FIREBASE_CONFIG ||
    process.env.GCLOUD_PROJECT ||
    process.env.K_SERVICE // Cloud Run
  );

  if (getApps().length === 0) {
    if (firebaseConfig?.projectId && hasGoogleCredentials) {
      initializeApp({
        projectId: firebaseConfig.projectId,
      });
    } else if (firebaseConfig?.projectId) {
      console.warn('Google credentials not detected - using local JSON storage with Firestore REST fallback.');
    }
  }
} catch (error) {
  console.warn("Firebase admin init notice (using local/REST storage fallback):", error);
}

let adminDbInstance: ReturnType<typeof getFirestore> | null = null;
function getAdminFirestore() {
  if (!adminDbInstance) {
    try {
      const apps = getApps();
      if (apps.length > 0) {
        const app = apps[0];
        if (firestoreDbId) {
          adminDbInstance = getFirestore(app, firestoreDbId);
        } else {
          adminDbInstance = getFirestore(app);
        }
      }
    } catch (e) {
      console.warn("getAdminFirestore notice (local storage active):", e);
      adminDbInstance = null;
    }
  }
  return adminDbInstance;
}

// Firestore REST Fallback helpers using web API key
const FIRESTORE_REST_BASE = firebaseConfig?.projectId
  ? `https://firestore.googleapis.com/v1/projects/${firebaseConfig.projectId}/databases/${firestoreDbId || '(default)'}/documents`
  : '';
const FIRESTORE_API_KEY = firebaseConfig?.apiKey || '';

function toFirestoreFields(obj: any): any {
  const fields: any = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value === null || value === undefined) continue;
    if (typeof value === 'string') {
      fields[key] = { stringValue: value };
    } else if (typeof value === 'number') {
      fields[key] = Number.isInteger(value) ? { integerValue: String(value) } : { doubleValue: value };
    } else if (typeof value === 'boolean') {
      fields[key] = { booleanValue: value };
    } else if (value instanceof Date) {
      fields[key] = { timestampValue: value.toISOString() };
    } else if (Array.isArray(value)) {
      fields[key] = {
        arrayValue: {
          values: value.map((v) => ({ stringValue: String(v) })),
        },
      };
    } else if (typeof value === 'object') {
      fields[key] = { mapValue: { fields: toFirestoreFields(value) } };
    }
  }
  return fields;
}

function fromFirestoreDoc(doc: any): any {
  if (!doc) return null;
  const id = doc.name ? doc.name.split('/').pop() : '';
  const result: any = { id };
  if (!doc.fields) return result;
  for (const [key, valObj] of Object.entries(doc.fields as Record<string, any>)) {
    if ('stringValue' in valObj) result[key] = valObj.stringValue;
    else if ('integerValue' in valObj) result[key] = parseInt(valObj.integerValue, 10);
    else if ('doubleValue' in valObj) result[key] = valObj.doubleValue;
    else if ('booleanValue' in valObj) result[key] = valObj.booleanValue;
    else if ('timestampValue' in valObj) result[key] = valObj.timestampValue;
    else if ('mapValue' in valObj) result[key] = fromFirestoreDoc(valObj.mapValue);
    else if ('arrayValue' in valObj) result[key] = (valObj.arrayValue.values || []).map((v: any) => v.stringValue || Object.values(v)[0]);
  }
  return result;
}

async function restFirestoreAdd(collection: string, data: any): Promise<string> {
  if (!FIRESTORE_REST_BASE || !FIRESTORE_API_KEY) {
    throw new Error('Firestore config missing');
  }
  const fields = toFirestoreFields(data);
  const res = await fetch(`${FIRESTORE_REST_BASE}/${collection}?key=${FIRESTORE_API_KEY}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
  if (!res.ok) {
    const txt = await res.text();
    throw new Error(`Firestore REST error (${res.status}): ${txt}`);
  }
  const json: any = await res.json();
  return json.name ? json.name.split('/').pop() : crypto.randomBytes(8).toString('hex');
}

async function restFirestoreSet(collection: string, docId: string, data: any): Promise<void> {
  if (!FIRESTORE_REST_BASE || !FIRESTORE_API_KEY) return;
  const fields = toFirestoreFields(data);
  await fetch(`${FIRESTORE_REST_BASE}/${collection}/${docId}?key=${FIRESTORE_API_KEY}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ fields }),
  });
}

async function restFirestoreGet(collection: string, docId: string): Promise<any | null> {
  if (!FIRESTORE_REST_BASE || !FIRESTORE_API_KEY) return null;
  const res = await fetch(`${FIRESTORE_REST_BASE}/${collection}/${docId}?key=${FIRESTORE_API_KEY}`);
  if (res.status === 404 || !res.ok) return null;
  const json: any = await res.json();
  return fromFirestoreDoc(json);
}

async function restFirestoreList(collection: string): Promise<any[]> {
  if (!FIRESTORE_REST_BASE || !FIRESTORE_API_KEY) return [];
  const res = await fetch(`${FIRESTORE_REST_BASE}/${collection}?key=${FIRESTORE_API_KEY}`);
  if (!res.ok) return [];
  const json: any = await res.json();
  if (!json.documents) return [];
  return json.documents.map(fromFirestoreDoc);
}

async function restFirestoreDelete(collection: string, docId: string): Promise<void> {
  if (!FIRESTORE_REST_BASE || !FIRESTORE_API_KEY) return;
  await fetch(`${FIRESTORE_REST_BASE}/${collection}/${docId}?key=${FIRESTORE_API_KEY}`, {
    method: 'DELETE',
  });
}

// Persistent local file storage helpers for zero-config deployment across any host (Cloudflare Containers, Railway, Docker, Render, VPS)
const DATA_DIR = path.join(process.cwd(), 'data');
try {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
} catch (e) {}

const TOKENS_FILE = path.join(DATA_DIR, 'tokens.json');
const SUBMISSIONS_FILE = path.join(DATA_DIR, 'submissions.json');
const SCREENSHOTS_FILE = path.join(DATA_DIR, 'screenshots.json');
const VIEWS_FILE = path.join(DATA_DIR, 'views.json');
const IDEAS_FILE = path.join(DATA_DIR, 'ideas.json');

function loadLocalJson(file: string, fallback: any) {
  try {
    if (fs.existsSync(file)) {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    }
  } catch (e) {}
  return fallback;
}

function saveLocalJson(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
  } catch (e) {}
}

// In-memory + disk cache stores for resilient multi-layer persistence
const initialTokens: any[] = loadLocalJson(TOKENS_FILE, []);
const memoryTokens: Map<string, any> = new Map(
  initialTokens.map((t: any) => [t.token || t.id, t])
);
const memorySubmissions: any[] = loadLocalJson(SUBMISSIONS_FILE, []);
const memoryViews: any[] = loadLocalJson(VIEWS_FILE, []);
const DEFAULT_STUDIO_SCREENSHOTS = [
  {
    id: 'proof-age-gender',
    label: 'YouTube Studio Age & Gender Demographics Proof',
    imageUrl: '/age-gender.jpeg',
    category: 'demographics',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proof-geography',
    label: 'YouTube Studio Top Geography & Country Distribution Proof',
    imageUrl: '/geography.jpeg',
    category: 'geography',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proof-monthly-audience',
    label: 'YouTube Studio Monthly Audience Reach & Growth Proof',
    imageUrl: '/monthly-audience.jpeg',
    category: 'reach',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proof-avd',
    label: 'YouTube Studio Average View Duration & Retention Proof',
    imageUrl: '/avd.jpeg',
    category: 'retention',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'proof-cta',
    label: 'YouTube Studio Impressions Click-Through Rate (CTR) Proof',
    imageUrl: '/cta.jpeg',
    category: 'retention',
    createdAt: new Date().toISOString(),
  },
];

const loadedScreenshots = loadLocalJson(SCREENSHOTS_FILE, []);
const memoryScreenshots: any[] = loadedScreenshots.length > 0 ? loadedScreenshots : DEFAULT_STUDIO_SCREENSHOTS;
if (loadedScreenshots.length === 0) {
  saveLocalJson(SCREENSHOTS_FILE, memoryScreenshots);
}
const memoryIdeas: any[] = loadLocalJson(IDEAS_FILE, []);

const PRIMARY_ADMIN_EMAIL = 'ss3825424@gmail.com';
const ADMIN_EMAILS = ['ss3825424@gmail.com'];

// Session secret must come from the environment. When it is missing we generate an
// ephemeral one so the app still boots, but every restart invalidates old sessions.
const SESSION_SECRET = process.env.SESSION_SECRET || crypto.randomBytes(48).toString('hex');
if (!process.env.SESSION_SECRET) {
  console.warn('SESSION_SECRET is not set. Using a temporary secret; admin sessions will be invalidated on restart.');
}

const ADMIN_USERNAME = (process.env.ADMIN_USERNAME || 'admin').trim();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
if (!ADMIN_PASSWORD) {
  console.warn('ADMIN_PASSWORD is not set. The /admin dashboard login is disabled until it is configured.');
}

function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

const checkIsAdmin = (username?: string | null): boolean => {
  if (!username) return false;
  const u = username.trim().toLowerCase();
  return u === ADMIN_USERNAME.toLowerCase() || u === PRIMARY_ADMIN_EMAIL.toLowerCase();
};

function hashPassword(password: string, salt?: string): { hash: string; salt: string } {
  const actualSalt = salt || crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, actualSalt, 1000, 64, 'sha512').toString('hex');
  return { hash, salt: actualSalt };
}

function verifyPassword(password: string, hash: string, salt: string): boolean {
  const computed = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return computed === hash;
}

function createSessionToken(payload: { uid: string; username: string; displayName?: string; isAdmin: boolean }): string {
  const header = Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64url');
  const body = Buffer.from(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60, // 30 days
    })
  ).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
  return `${header}.${body}.${signature}`;
}

function verifySessionToken(token: string): { uid: string; username: string; displayName?: string; isAdmin: boolean } | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = crypto.createHmac('sha256', SESSION_SECRET).update(`${header}.${body}`).digest('base64url');
    if (!safeEqual(signature, expected)) return null;
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

// Used whenever the YouTube Data API is unavailable (no key, quota exhausted, network error).
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

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_MODEL = process.env.GEMINI_MODEL || 'gemini-3.7-flash';
if (!GEMINI_API_KEY) {
  console.warn('GEMINI_API_KEY is not set. AI assisted endpoints will fall back to non-AI extraction.');
}

const ai = GEMINI_API_KEY
  ? new GoogleGenAI({
      apiKey: GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    })
  : null;

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  // Enable trust proxy for reverse proxy environment (Cloud Run / Nginx)
  app.set('trust proxy', 1);

  // 1. Secure Headers
  app.use(helmet({
    crossOriginOpenerPolicy: false,
    xFrameOptions: false,
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", "https://apis.google.com", "https://*.firebaseapp.com", "https://*.gstatic.com"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        imgSrc: ["'self'", "data:", "blob:", "https://*"],
        connectSrc: ["'self'", "https://*"],
        fontSrc: ["'self'", "https://fonts.gstatic.com", "data:"],
        objectSrc: ["'none'"],
        upgradeInsecureRequests: [],
        frameAncestors: ["*"],
      },
    },
  }));

  app.use(express.json({ limit: '50mb' }));
  app.use(express.urlencoded({ limit: '50mb', extended: true }));

  // Strict Brute-Force Rate Limiter for Authentication
  const loginLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // max 10 attempts per 15 min per IP
    message: { error: 'Too many authentication attempts. Please wait 15 minutes before trying again to protect account security.' },
    standardHeaders: true,
    legacyHeaders: false,
    validate: {
      xForwardedForHeader: false,
      forwardedHeader: false,
      trustProxy: false,
    },
  });

  // Public Security Status Endpoint
  app.get('/api/admin/security-status', (req: any, res: any) => {
    return res.json({
      success: true,
      authMethod: 'Username & Password Only',
      securityPolicy: 'Strict Administrator Credential Authentication',
      status: 'Enforced',
    });
  });

  // 2. Auth & Admin Endpoints - Username and Password Only
  app.post('/api/admin/login', loginLimiter, (req: any, res: any) => {
    try {
      const { username, password } = req.body || {};
      if (!username || !password) {
        return res.status(400).json({ error: 'Username and password are required' });
      }

      if (!ADMIN_PASSWORD) {
        return res.status(503).json({
          error: 'Administrator login is not configured on this server. Set ADMIN_PASSWORD in the environment.',
        });
      }

      const inputUser = String(username).trim();
      const isAuthorizedUser = checkIsAdmin(inputUser);
      const isPasswordValid = safeEqual(String(password).trim(), ADMIN_PASSWORD.trim());

      if (isAuthorizedUser && isPasswordValid) {
        const payload = {
          uid: 'admin_master',
          username: inputUser,
          displayName: 'Administrator',
          isAdmin: true,
        };
        const token = createSessionToken(payload);
        return res.json({
          success: true,
          token,
          user: {
            username: inputUser,
            displayName: 'Administrator',
            isAdmin: true,
          },
        });
      }

      return res.status(401).json({ error: 'Invalid username or password.' });
    } catch (err: any) {
      console.error('Admin login error:', err);
      return res.status(500).json({ error: 'Authentication service error' });
    }
  });

  // Google / Firebase ID Token Login is disabled
  app.post('/api/admin/firebase-auth', (req: any, res: any) => {
    return res.status(403).json({ error: 'Google sign-in is disabled. Please log in using username and password.' });
  });

  app.get('/api/admin/me', (req: any, res: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: No token provided' });
    }
    const token = authHeader.split('Bearer ')[1];
    const sessionPayload = verifySessionToken(token);
    if (sessionPayload && sessionPayload.isAdmin && checkIsAdmin(sessionPayload.username)) {
      return res.json({
        success: true,
        user: {
          uid: sessionPayload.uid,
          username: sessionPayload.username,
          displayName: sessionPayload.displayName || 'Administrator',
          isAdmin: true,
        },
      });
    }
    return res.status(401).json({ error: 'Unauthorized: Session invalid or expired' });
  });

  // Server-side Cached YouTube Public Videos (API key kept strictly server-side)
  let cachedYouTubeVideos: {
    videos: any[];
    cachedAt: number;
  } | null = null;
  const VIDEOS_CACHE_TTL = 6 * 60 * 60 * 1000; // 6 hours

  app.get('/api/youtube/videos', async (req: any, res: any) => {
    try {
      const now = Date.now();
      if (cachedYouTubeVideos && now - cachedYouTubeVideos.cachedAt < VIDEOS_CACHE_TTL) {
        return res.json({
          success: true,
          cached: true,
          videos: cachedYouTubeVideos.videos,
        });
      }

      const apiKey = process.env.YOUTUBE_API_KEY || '';
      const playlistId = process.env.YOUTUBE_PLAYLIST_ID || 'UU81LtJSjn6ZBwFadGUw57lw';

      if (!apiKey) {
        return res.json({ success: true, cached: false, videos: FALLBACK_VIDEOS });
      }

      const playlistUrl = `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet,contentDetails&playlistId=${playlistId}&key=${apiKey}&maxResults=20`;
      const playlistRes = await fetch(playlistUrl);
      const playlistJson = await playlistRes.json();

      let videos: any[] = [];
      if (playlistJson.items && playlistJson.items.length > 0) {
        const videoIds = playlistJson.items
          .map((p: any) => p.contentDetails?.videoId || p.snippet?.resourceId?.videoId)
          .filter(Boolean)
          .join(',');

        if (videoIds) {
          const detailsUrl = `https://www.googleapis.com/youtube/v3/videos?part=snippet,statistics,contentDetails,liveStreamingDetails&id=${videoIds}&key=${apiKey}`;
          const detailsRes = await fetch(detailsUrl);
          const detailsJson = await detailsRes.json();

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
        cachedYouTubeVideos = {
          videos,
          cachedAt: now,
        };
        return res.json({ success: true, cached: false, videos });
      }

      // Safe fallback if YouTube Data API quota or network issue
      return res.json({ success: true, cached: false, videos: FALLBACK_VIDEOS });
    } catch (err: any) {
      console.error('Failed to fetch YouTube videos:', err);
      return res.json({ success: true, cached: false, videos: FALLBACK_VIDEOS });
    }
  });
  // Public Media Kit Request Submission
  const kitRequestLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too many requests from this network. Please try again later.' },
  });

  app.post('/api/kit/request', kitRequestLimiter, async (req: any, res: any) => {
    try {
      let { name, company, email, promotionGoal } = req.body;
      if (!name || !company || !email || !promotionGoal) {
        return res.status(400).json({ error: 'All fields are required (Name, Company, Work Email, Promotion Goal)' });
      }

      name = sanitizeHtml(String(name).trim(), { allowedTags: [] }).slice(0, 120);
      company = sanitizeHtml(String(company).trim(), { allowedTags: [] }).slice(0, 160);
      email = sanitizeHtml(String(email).trim().toLowerCase(), { allowedTags: [] }).slice(0, 200);
      promotionGoal = sanitizeHtml(String(promotionGoal).trim(), { allowedTags: [] }).slice(0, 2000);

      if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) {
        return res.status(400).json({ error: 'Please provide a valid work email address.' });
      }

      const submissionDoc = {
        name,
        company,
        email,
        promotionGoal,
        status: 'pending',
        createdAt: new Date().toISOString(),
      };

      let docId = crypto.randomBytes(8).toString('hex');
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const ref = await adminDb.collection('kit_submissions').add(submissionDoc);
          docId = ref.id;
        }
      } catch (dbErr) {
        try {
          docId = await restFirestoreAdd('kit_submissions', submissionDoc);
        } catch (restErr) {
          console.warn('REST save notice:', restErr);
        }
      }

      const memoryItem = { id: docId, ...submissionDoc };
      memorySubmissions.unshift(memoryItem);
      saveLocalJson(SUBMISSIONS_FILE, memorySubmissions);

      return res.json({
        success: true,
        id: docId,
        message: 'Your media kit request has been received. A personalized link will be sent to your work email.',
      });
    } catch (err: any) {
      console.error('Kit request error:', err);
      return res.status(500).json({ error: err.message || 'Failed to submit media kit request' });
    }
  });

  // Tier 2: Gated Kit verification endpoint - returns real 404 on bad or expired token
  app.get('/api/kit/:token', async (req: any, res: any) => {
    try {
      const token = (req.params.token || '').trim();
      if (!token || token.length < 4) {
        return res.status(404).json({ error: 'Not Found' });
      }

      let tokenData = memoryTokens.get(token);

      if (!tokenData) {
        try {
          const adminDb = getAdminFirestore();
          if (adminDb) {
            const tokenDoc = await adminDb.collection('kit_tokens').doc(token).get();
            if (tokenDoc.exists) {
              tokenData = tokenDoc.data();
            }
          }
        } catch (dbErr) {
          // ignore
        }
      }

      if (!tokenData) {
        try {
          tokenData = await restFirestoreGet('kit_tokens', token);
        } catch (restErr) {
          // ignore
        }
      }

      if (!tokenData || tokenData.revoked) {
        return res.status(404).json({ error: 'Not Found' });
      }

      // Check expiration
      if (tokenData.expiresAt) {
        const expTime = new Date(tokenData.expiresAt).getTime();
        if (!isNaN(expTime) && expTime < Date.now()) {
          return res.status(404).json({ error: 'Not Found' });
        }
      }

      // Log the view event for traceable brand review
      const viewLog = {
        token,
        brandName: tokenData.brandName || tokenData.company || 'Unknown Brand',
        company: tokenData.company || '',
        openedAt: new Date().toISOString(),
        userAgent: req.headers['user-agent'] || 'Unknown User-Agent',
        ip: req.ip || req.headers['x-forwarded-for'] || '0.0.0.0',
      };
      memoryViews.unshift({ id: crypto.randomBytes(8).toString('hex'), ...viewLog });
      if (memoryViews.length > 500) memoryViews.length = 500;
      saveLocalJson(VIEWS_FILE, memoryViews);

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('kit_views').add(viewLog);
        }
      } catch (dbErr) {
        try {
          await restFirestoreAdd('kit_views', viewLog);
        } catch (rErr) {}
      }

      // Fetch uploaded monthly studio screenshots
      let screenshots: any[] = [...memoryScreenshots];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snaps = await adminDb.collection('studio_screenshots').get();
          if (!snaps.empty) {
            const remoteSnaps = snaps.docs.map((d: any) => ({ id: d.id, ...d.data() }));
            for (const r of remoteSnaps) {
              if (!screenshots.some((s) => s.id === r.id || s.imageUrl === r.imageUrl)) {
                screenshots.push(r);
              }
            }
          }
        }
      } catch (snapErr) {
        try {
          const restSnaps = await restFirestoreList('studio_screenshots');
          if (restSnaps.length > 0) {
            for (const r of restSnaps) {
              if (!screenshots.some((s) => s.id === r.id || s.imageUrl === r.imageUrl)) {
                screenshots.push(r);
              }
            }
          }
        } catch (rErr) {}
      }

      // Fetch video ideas for integrated partnership scoping
      let videoIdeas: any[] = [...memoryIdeas];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const ideaSnaps = await adminDb.collection('video_ideas').get();
          if (!ideaSnaps.empty) {
            videoIdeas = ideaSnaps.docs.map((d: any) => ({ id: d.id, ...d.data() }));
          }
        }
      } catch (ideaErr) {
        try {
          const restIdeas = await restFirestoreList('video_ideas');
          if (restIdeas.length > 0) videoIdeas = restIdeas;
        } catch (rErr) {}
      }

      // Merge memory ideas if not present
      for (const mIdea of memoryIdeas) {
        if (!videoIdeas.some((v) => v.id === mIdea.id)) {
          videoIdeas.push(mIdea);
        }
      }

      // Return gated kit data with dynamically updated month and year (no day)
      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dynamicScreenshots = screenshots.map((s: any) => ({
        ...s,
        monthYear: currentMonthYear,
        dateRange: '',
      }));

      return res.json({
        success: true,
        brandName: tokenData.brandName || tokenData.company,
        company: tokenData.company,
        preparedMonthYear: currentMonthYear,
        expiresAt: tokenData.expiresAt,
        screenshots: dynamicScreenshots,
        videoIdeas,
        rateCard: {
          dedicatedVideo: `$${tokenData.dedicatedPrice || 1200}`,
          integratedSegment: `$${tokenData.integratedPrice || 600}`,
          commercialUsageRights60Day: `+$${tokenData.commercialUsagePrice || 350}`,
        },
        turnaround: '5-7 business days for Integrated, 10-14 business days for Dedicated',
        availability: 'Accepting 2-3 sponsors/month - 1 slot remaining',
        retentionAndCtr: {
          retention: '[NEEDS REAL DATA]',
          ctr: '[NEEDS REAL DATA]',
        },
      });
    } catch (err: any) {
      console.error('Kit lookup error:', err);
      return res.status(404).json({ error: 'Not Found' });
    }
  });

  // Auth verification middleware for admin routes
  const requireAdmin = async (req: any, res: any, next: any) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
    }
    const token = authHeader.split('Bearer ')[1];

    // 1. Try our internal session JWT first
    const sessionPayload = verifySessionToken(token);
    if (sessionPayload) {
      if (sessionPayload.isAdmin && checkIsAdmin(sessionPayload.username)) {
        req.user = sessionPayload;
        return next();
      }
      return res.status(403).json({ error: 'Forbidden: Admin access restricted' });
    }

    return res.status(401).json({ error: 'Unauthorized: Invalid or expired token' });
  };

  // Admin: Get All Kit Submissions
  app.get('/api/admin/submissions', requireAdmin, async (req: any, res: any) => {
    try {
      let submissions: any[] = [];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snap = await adminDb.collection('kit_submissions').get();
          submissions = snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      } catch (dbErr) {
        try {
          submissions = await restFirestoreList('kit_submissions');
        } catch (rErr) {}
      }

      // Merge memory submissions
      for (const mem of memorySubmissions) {
        if (!submissions.some((s) => s.id === mem.id)) {
          submissions.push(mem);
        }
      }

      submissions.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      return res.json({ success: true, submissions });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch submissions' });
    }
  });

  // Admin: Generate Gated Token
  app.post('/api/admin/generate-token', requireAdmin, async (req: any, res: any) => {
    try {
      const {
        submissionId,
        brandName,
        company,
        email,
        expiryDays,
        customExpiryDate,
        dedicatedPrice,
        integratedPrice,
        commercialUsagePrice,
      } = req.body;
      if (!brandName && !company) {
        return res.status(400).json({ error: 'Brand name or company is required' });
      }

      const token = crypto.randomBytes(16).toString('hex');
      let expiresAt: string;

      const customDate = customExpiryDate ? new Date(customExpiryDate) : null;
      if (customDate && !isNaN(customDate.getTime())) {
        expiresAt = customDate.toISOString();
      } else {
        const days = Number(expiryDays) || 14;
        const expDate = new Date();
        expDate.setDate(expDate.getDate() + days);
        expiresAt = expDate.toISOString();
      }

      const parsedDedicatedPrice = dedicatedPrice !== undefined && !isNaN(Number(dedicatedPrice))
        ? Math.max(500, Math.min(50000, Number(dedicatedPrice)))
        : 1200;
      const parsedIntegratedPrice = integratedPrice !== undefined && !isNaN(Number(integratedPrice))
        ? Math.max(500, Math.min(50000, Number(integratedPrice)))
        : 600;
      const parsedCommercialUsagePrice = commercialUsagePrice !== undefined && !isNaN(Number(commercialUsagePrice))
        ? Math.max(0, Math.min(20000, Number(commercialUsagePrice)))
        : 350;

      const tokenDoc = {
        token,
        submissionId: submissionId || null,
        brandName: sanitizeHtml(String(brandName || company).trim(), { allowedTags: [] }).slice(0, 160),
        company: sanitizeHtml(String(company || brandName).trim(), { allowedTags: [] }).slice(0, 160),
        email: email ? sanitizeHtml(String(email).trim().toLowerCase(), { allowedTags: [] }).slice(0, 200) : '',
        createdAt: new Date().toISOString(),
        expiresAt,
        revoked: false,
        dedicatedPrice: parsedDedicatedPrice,
        integratedPrice: parsedIntegratedPrice,
        commercialUsagePrice: parsedCommercialUsagePrice,
      };

      memoryTokens.set(token, tokenDoc);
      saveLocalJson(TOKENS_FILE, Array.from(memoryTokens.values()));

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('kit_tokens').doc(token).set(tokenDoc);
          if (submissionId) {
            await adminDb.collection('kit_submissions').doc(submissionId).update({
              status: 'token_generated',
              token,
              expiresAt,
              link: `/kit/${token}`,
            });
          }
        } else {
          throw new Error('Fallback to REST');
        }
      } catch (dbErr) {
        try {
          await restFirestoreSet('kit_tokens', token, tokenDoc);
          if (submissionId) {
            const existingSub = await restFirestoreGet('kit_submissions', submissionId);
            if (existingSub) {
              existingSub.status = 'token_generated';
              existingSub.token = token;
              existingSub.expiresAt = expiresAt;
              existingSub.link = `/kit/${token}`;
              await restFirestoreSet('kit_submissions', submissionId, existingSub);
            }
          }
        } catch (rErr) {}
      }

      // Also update memory submission status if present
      const sub = memorySubmissions.find((s) => s.id === submissionId);
      if (sub) {
        sub.status = 'token_generated';
        sub.token = token;
        sub.expiresAt = expiresAt;
        sub.link = `/kit/${token}`;
        saveLocalJson(SUBMISSIONS_FILE, memorySubmissions);
      }

      return res.json({
        success: true,
        token,
        expiresAt,
        link: `/kit/${token}`,
        brandName: tokenDoc.brandName,
        dedicatedPrice: parsedDedicatedPrice,
        integratedPrice: parsedIntegratedPrice,
        commercialUsagePrice: parsedCommercialUsagePrice,
      });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to generate token' });
    }
  });

  // Admin: Get All Tokens
  app.get('/api/admin/tokens', requireAdmin, async (req: any, res: any) => {
    try {
      let tokens: any[] = [];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snap = await adminDb.collection('kit_tokens').get();
          tokens = snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      } catch (dbErr) {
        try {
          tokens = await restFirestoreList('kit_tokens');
        } catch (rErr) {}
      }

      for (const [key, memToken] of memoryTokens.entries()) {
        if (!tokens.some((t) => t.token === key || t.id === key)) {
          tokens.push(memToken);
        }
      }

      tokens.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      return res.json({ success: true, tokens });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch tokens' });
    }
  });

  // Admin: Delete Token
  app.post('/api/admin/delete-token', requireAdmin, async (req: any, res: any) => {
    try {
      const { tokenId } = req.body;
      if (!tokenId) return res.status(400).json({ error: 'Token is required' });

      const memToken = memoryTokens.get(tokenId.trim());
      if (memToken) {
        memoryTokens.delete(tokenId.trim());
        saveLocalJson(TOKENS_FILE, Array.from(memoryTokens.values()));
      }

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('kit_tokens').doc(tokenId.trim()).delete();
        } else {
          throw new Error('Fallback to REST');
        }
      } catch (dbErr) {
        try {
          await restFirestoreDelete('kit_tokens', tokenId.trim());
        } catch (rErr) {}
      }

      return res.json({ success: true, message: 'Token deleted successfully' });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete token' });
    }
  });

  // Admin: Get Studio Screenshots
  app.get('/api/admin/screenshots', requireAdmin, async (req: any, res: any) => {
    try {
      let screenshots: any[] = [];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snap = await adminDb.collection('studio_screenshots').get();
          screenshots = snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      } catch (dbErr) {
        try {
          screenshots = await restFirestoreList('studio_screenshots');
        } catch (rErr) {}
      }

      for (const mem of memoryScreenshots) {
        if (!screenshots.some((s) => s.id === mem.id)) {
          screenshots.push(mem);
        }
      }

      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const dynamicScreenshots = screenshots.map((s) => ({
        ...s,
        monthYear: currentMonthYear,
        dateRange: '',
      }));

      return res.json({ success: true, screenshots: dynamicScreenshots });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch screenshots' });
    }
  });

  // Admin: Upload / Save Studio Screenshot (Month/Year updates automatically)
  app.post('/api/admin/screenshots', requireAdmin, async (req: any, res: any) => {
    try {
      const { label, imageUrl, category, monthYear } = req.body;
      if (!imageUrl || !label) {
        return res.status(400).json({ error: 'Label and image URL are required' });
      }

      const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
      const screenshotDoc = {
        monthYear: monthYear ? sanitizeHtml(monthYear, { allowedTags: [] }) : currentMonthYear,
        label: sanitizeHtml(label, { allowedTags: [] }),
        imageUrl,
        dateRange: '',
        category: category || 'demographics',
        createdAt: new Date().toISOString(),
      };

      let id = crypto.randomBytes(8).toString('hex');
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const ref = await adminDb.collection('studio_screenshots').add(screenshotDoc);
          id = ref.id;
        }
      } catch (dbErr) {
        try {
          id = await restFirestoreAdd('studio_screenshots', screenshotDoc);
        } catch (rErr) {}
      }

      memoryScreenshots.unshift({ id, ...screenshotDoc });
      saveLocalJson(SCREENSHOTS_FILE, memoryScreenshots);

      return res.json({ success: true, id });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to save screenshot' });
    }
  });

  // Admin: Delete Studio Screenshot
  app.delete('/api/admin/screenshots/:id', requireAdmin, async (req: any, res: any) => {
    try {
      const id = req.params.id;
      const index = memoryScreenshots.findIndex((s) => s.id === id);
      if (index !== -1) {
        memoryScreenshots.splice(index, 1);
        saveLocalJson(SCREENSHOTS_FILE, memoryScreenshots);
      }

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('studio_screenshots').doc(id).delete();
        }
      } catch (dbErr) {
        try {
          await restFirestoreDelete('studio_screenshots', id);
        } catch (rErr) {}
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete screenshot' });
    }
  });

  // Admin: Get All Video Ideas
  app.get('/api/admin/video-ideas', requireAdmin, async (req: any, res: any) => {
    try {
      let ideas: any[] = [];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snap = await adminDb.collection('video_ideas').get();
          ideas = snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      } catch (dbErr) {
        try {
          ideas = await restFirestoreList('video_ideas');
        } catch (rErr) {}
      }

      for (const mem of memoryIdeas) {
        if (!ideas.some((i) => i.id === mem.id)) {
          ideas.push(mem);
        }
      }

      ideas.sort((a: any, b: any) => {
        const timeA = new Date(a.createdAt).getTime() || 0;
        const timeB = new Date(b.createdAt).getTime() || 0;
        return timeB - timeA;
      });

      return res.json({ success: true, ideas });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch video ideas' });
    }
  });

  // Admin: Add Video Idea
  app.post('/api/admin/video-ideas', requireAdmin, async (req: any, res: any) => {
    try {
      const { title, description, isBooked } = req.body;
      if (!title || !title.trim()) {
        return res.status(400).json({ error: 'Video title is required' });
      }

      const ideaDoc = {
        title: sanitizeHtml(title.trim(), { allowedTags: [] }),
        description: sanitizeHtml((description || '').trim(), { allowedTags: [] }),
        isBooked: Boolean(isBooked),
        createdAt: new Date().toISOString(),
      };

      let id = crypto.randomBytes(8).toString('hex');
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const ref = await adminDb.collection('video_ideas').add(ideaDoc);
          id = ref.id;
        }
      } catch (dbErr) {
        try {
          id = await restFirestoreAdd('video_ideas', ideaDoc);
        } catch (rErr) {}
      }

      const newIdea = { id, ...ideaDoc };
      memoryIdeas.unshift(newIdea);
      saveLocalJson(IDEAS_FILE, memoryIdeas);

      return res.json({ success: true, idea: newIdea });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to add video idea' });
    }
  });

  // Admin: Toggle Video Idea Booked Status
  app.patch('/api/admin/video-ideas/:id/toggle-booked', requireAdmin, async (req: any, res: any) => {
    try {
      const id = req.params.id;
      const { isBooked } = req.body;

      let currentBooked = false;
      const memIndex = memoryIdeas.findIndex((i) => i.id === id);
      if (memIndex !== -1) {
        currentBooked = typeof isBooked === 'boolean' ? isBooked : !Boolean(memoryIdeas[memIndex].isBooked);
        memoryIdeas[memIndex].isBooked = currentBooked;
        saveLocalJson(IDEAS_FILE, memoryIdeas);
      } else {
        currentBooked = typeof isBooked === 'boolean' ? isBooked : true;
      }

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('video_ideas').doc(id).set({ isBooked: currentBooked }, { merge: true });
        }
      } catch (dbErr) {
        try {
          await restFirestoreSet('video_ideas', id, { isBooked: currentBooked });
        } catch (rErr) {}
      }

      return res.json({ success: true, isBooked: currentBooked });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to update video idea booked status' });
    }
  });

  // Admin: Delete Video Idea
  app.delete('/api/admin/video-ideas/:id', requireAdmin, async (req: any, res: any) => {
    try {
      const id = req.params.id;
      const index = memoryIdeas.findIndex((i) => i.id === id);
      if (index !== -1) {
        memoryIdeas.splice(index, 1);
        saveLocalJson(IDEAS_FILE, memoryIdeas);
      }

      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          await adminDb.collection('video_ideas').doc(id).delete();
        }
      } catch (dbErr) {
        try {
          await restFirestoreDelete('video_ideas', id);
        } catch (rErr) {}
      }

      return res.json({ success: true });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to delete video idea' });
    }
  });

  // Admin: View Access Logs
  app.get('/api/admin/logs', requireAdmin, async (req: any, res: any) => {
    try {
      let logs: any[] = [];
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const snap = await adminDb.collection('kit_views').get();
          logs = snap.docs.map((d: any) => ({
            id: d.id,
            ...d.data(),
          }));
        }
      } catch (dbErr) {
        try {
          logs = await restFirestoreList('kit_views');
        } catch (rErr) {}
      }

      for (const mem of memoryViews) {
        if (!logs.some((l) => l.id === mem.id)) {
          logs.push(mem);
        }
      }

      logs.sort((a: any, b: any) => {
        const timeA = new Date(a.openedAt).getTime() || 0;
        const timeB = new Date(b.openedAt).getTime() || 0;
        return timeB - timeA;
      });

      return res.json({ success: true, logs });
    } catch (err: any) {
      return res.status(500).json({ error: err.message || 'Failed to fetch logs' });
    }
  });

  app.post('/api/admin/extract-email', requireAdmin, async (req: any, res: any) => {
    try {
      const { emailText } = req.body;
      if (!emailText) {
        return res.status(400).json({ error: 'Email text is required' });
      }

      const prompt = `Analyze this email text. Extract the sender's name (the specific person) and the company or brand name they represent.
If you can't confidently determine one of them, leave it blank. Return JSON with contactName and companyName keys.

Email Text:
"""
${emailText}
"""`;

      let contactName = '';
      let companyName = '';

      try {
        if (!ai) throw new Error('Gemini API key not configured');
        const response = await ai.models.generateContent({
          model: GEMINI_MODEL,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                contactName: { type: Type.STRING, description: 'The name of the person sending the email' },
                companyName: { type: Type.STRING, description: 'The name of the company or brand' },
              },
              required: ['contactName', 'companyName'],
            },
          },
        });
        const parsed = JSON.parse(response.text?.trim() || '{}');
        contactName = parsed.contactName || '';
        companyName = parsed.companyName || '';
      } catch (genErr) {
        try {
          if (!ai) throw new Error('Gemini API key not configured');
          const interaction = await ai.interactions.create({
            model: GEMINI_MODEL,
            input: prompt,
            response_format: {
              type: Type.OBJECT,
              properties: {
                contactName: { type: Type.STRING, description: 'The name of the person sending the email' },
                companyName: { type: Type.STRING, description: 'The name of the company or brand' },
              },
              required: ['contactName', 'companyName']
            }
          });

          const lastStep = interaction.steps.at(-1);
          let jsonStr = '';
          if (lastStep && lastStep.type === 'model_output') {
            const textContent = lastStep.content?.find((c: any) => c.type === 'text') as any;
            if (textContent && textContent.text) {
              jsonStr = textContent.text.trim();
            }
          }
          const result = JSON.parse(jsonStr || '{}');
          contactName = result.contactName || '';
          companyName = result.companyName || '';
        } catch (intErr) {}
      }

      // Regex fallback if needed
      if (!contactName) {
        const nameMatch = emailText.match(/(?:(?:from|i'm|i am|this is|regards,?|sincerely,?|cheers,?|best,?|thanks,?)\s+)([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
        if (nameMatch && nameMatch[1]) {
          contactName = nameMatch[1].trim();
        }
      }

      if (!companyName) {
        const coMatch = emailText.match(/(?:at|from|representing|with)\s+([A-Z0-9][a-zA-Z0-9.\-_]+(?:\s+[A-Z0-9][a-zA-Z0-9.\-_]+)?)/i) ||
                        emailText.match(/@([a-zA-Z0-9\-]+)\.(?:com|io|co|ai|net|org|dev)/i);
        if (coMatch && coMatch[1]) {
          const rawCo = coMatch[1].trim();
          companyName = rawCo.charAt(0).toUpperCase() + rawCo.slice(1);
        }
      }

      return res.json({ success: true, contactName, companyName });

    } catch (error: any) {
      console.error('Email extraction error:', error);
      res.status(500).json({ error: error.message || 'Failed to extract email info' });
    }
  });

  // 3. Rate Limiting for /api/gemini/generate
  const generateLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 20, // limit each IP to 20 requests per windowMs
    message: { error: 'Too many requests, please try again later.' }
  });

  app.post('/api/gemini/generate', generateLimiter, requireAdmin, async (req: any, res: any) => {
    try {
      let { text, type } = req.body;

      if (!text || !type) {
        return res.status(400).json({ error: 'Text and type are required' });
      }

      // 4. Input Sanitization
      text = sanitizeHtml(text, {
        allowedTags: [],
        allowedAttributes: {}
      });

      const prompt = `You are a technical content editor. Extract structured information from the provided raw notes/script.
Type of content: ${type}
Raw notes/script:
${text}

Extract the following:
- title: A concise, engaging title.
- description: A short, compelling description summarizing the content.
- coverTag: A short uppercase label (e.g., "AI & Automation", "TOPVIEW AI") for the category badge.
${type === 'challenge' ? '- checklist: An array of step-by-step checklist items, each represented by a string. Extract actionable steps from the text.' : ''}`;

      const schemaProperties: Record<string, any> = {
        title: { type: Type.STRING, description: 'A concise, engaging title.' },
        description: { type: Type.STRING, description: 'A short, compelling description.' },
        coverTag: { type: Type.STRING, description: 'A short uppercase label for the category badge.' },
      };

      if (type === 'challenge') {
        schemaProperties.checklist = {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'An array of step-by-step checklist items.',
        };
      }

      if (!ai) {
        return res.status(503).json({ error: 'AI generation is unavailable: GEMINI_API_KEY is not configured on the server.' });
      }

      const interaction = await ai.interactions.create({
        model: GEMINI_MODEL,
        input: prompt,
        response_format: {
          type: Type.OBJECT,
          properties: schemaProperties,
          required: ['title', 'description', 'coverTag', ...(type === 'challenge' ? ['checklist'] : [])],
        },
      });

      const lastStep = interaction.steps.at(-1);
      let jsonStr = '';
      if (lastStep && lastStep.type === 'model_output') {
        const textContent = lastStep.content?.find((c: any) => c.type === 'text') as any;
        if (textContent && textContent.text) {
          jsonStr = textContent.text.trim();
        }
      }
      const result = JSON.parse(jsonStr || '{}');

      // Sanitize the generated result strings to be extra safe
      if (result.title) result.title = sanitizeHtml(result.title, { allowedTags: [] });
      if (result.description) result.description = sanitizeHtml(result.description, { allowedTags: [] });
      if (result.coverTag) result.coverTag = sanitizeHtml(result.coverTag, { allowedTags: [] });
      if (result.checklist && Array.isArray(result.checklist)) {
        result.checklist = result.checklist.map((item: string) => sanitizeHtml(item, { allowedTags: [] }));
      }

      res.json(result);
    } catch (error: any) {
      console.error('Error generating content:', error);
      res.status(500).json({ error: error.message || 'Failed to generate content' });
    }
  });

  app.post('/api/content/publish', requireAdmin, async (req: any, res: any) => {
    try {
      const { type, title, description, coverTag, checklist } = req.body;
      if (!type || !title || !description) {
        return res.status(400).json({ error: 'Missing required content fields' });
      }
      const docData: any = {
        type,
        title,
        description,
        coverTag: coverTag || 'AI & Tech',
        createdAt: new Date().toISOString(),
      };
      if (type === 'challenge' && Array.isArray(checklist)) {
        docData.checklist = checklist.map((step: any) => typeof step === 'string' ? { step, done: false } : step);
      }
      let docId = crypto.randomBytes(8).toString('hex');
      try {
        const adminDb = getAdminFirestore();
        if (adminDb) {
          const docRef = await adminDb.collection('content').add(docData);
          docId = docRef.id;
        }
      } catch (err: any) {
        console.warn('Firestore publish notice (fallback to local):', err.message);
      }
      return res.json({ success: true, id: docId });
    } catch (err: any) {
      console.error('Publish error:', err);
      return res.status(500).json({ error: err.message || 'Failed to publish content' });
    }
  });

  // Unknown API routes must return JSON, never the SPA shell
  app.use('/api', (req: any, res: any) => {
    res.status(404).json({ error: 'Not Found' });
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      const indexPath = path.join(distPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send(`
          <!DOCTYPE html>
          <html>
            <head><title>App Server Running</title><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
            <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background: #f8fafc; padding: 20px; box-sizing: border-box;">
              <div style="max-width: 520px; width: 100%; padding: 36px; background: white; border-radius: 20px; border: 1px solid #e2e8f0; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05);">
                <div style="width: 48px; height: 48px; background: #e0f2fe; border-radius: 12px; display: flex; align-items: center; justify-content: center; margin-bottom: 20px; color: #0284c7; font-size: 24px; font-weight: bold;">&#10003;</div>
                <h2 style="margin: 0 0 12px 0; color: #0f172a; font-size: 20px; font-weight: 700;">Backend Server is Live</h2>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">The server is actively running on port 3000. To serve the full React interface in production mode, generate the build files once:</p>
                <div style="background: #0f172a; color: #38bdf8; padding: 14px 16px; border-radius: 10px; font-family: monospace; font-size: 13px; margin-bottom: 16px;">npm run build</div>
                <p style="color: #64748b; font-size: 14px; line-height: 1.6; margin: 0 0 16px 0;">For local interactive development with live reloading, run instead:</p>
                <div style="background: #0f172a; color: #38bdf8; padding: 14px 16px; border-radius: 10px; font-family: monospace; font-size: 13px;">npm run dev</div>
              </div>
            </body>
          </html>
        `);
      }
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

// Safety net: a rejected background promise (e.g. a Firestore write retrying after the
// response was already sent) must never take the whole server down.
process.on('unhandledRejection', (reason) => {
  console.error('Unhandled promise rejection (ignored):', reason);
});

startServer().catch((err) => {
  console.error('Fatal: failed to start server', err);
  process.exit(1);
});
