function base64url(str: string): string {
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(s: string): string {
  let b = s.replace(/-/g, '+').replace(/_/g, '/');
  while (b.length % 4) b += '=';
  return atob(b);
}

async function hmacSign(secret: string, data: string): Promise<string> {
  const enc = new TextEncoder();
  const key = await crypto.subtle.importKey('raw', enc.encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, enc.encode(data));
  const bytes = new Uint8Array(sig);
  let binary = '';
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function createSessionToken(
  payload: { uid: string; username: string; displayName?: string; isAdmin: boolean },
  secret: string
): Promise<string> {
  const header = base64url(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const body = base64url(
    JSON.stringify({
      ...payload,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60,
    })
  );
  const signature = await hmacSign(secret, `${header}.${body}`);
  return `${header}.${body}.${signature}`;
}

export async function verifySessionToken(
  token: string,
  secret: string
): Promise<{ uid: string; username: string; displayName?: string; isAdmin: boolean } | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, body, signature] = parts;
    const expected = await hmacSign(secret, `${header}.${body}`);
    if (signature !== expected) return null;
    const payload = JSON.parse(base64urlDecode(body));
    if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
    return payload;
  } catch {
    return null;
  }
}

export function checkIsAdmin(username: string | null | undefined, adminUsername: string): boolean {
  if (!username) return false;
  return username.trim().toLowerCase() === adminUsername.trim().toLowerCase();
}

export async function requireAdmin(
  request: Request,
  env: any
): Promise<{ uid: string; username: string; displayName?: string; isAdmin: boolean } | Response> {
  const authHeader = request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return new Response(JSON.stringify({ error: 'Unauthorized: Missing or invalid token' }), {
      status: 401,
      headers: { 'content-type': 'application/json' },
    });
  }
  const token = authHeader.slice(7);
  const sessionSecret = env.SESSION_SECRET || '';
  const adminUsername = (env.ADMIN_USERNAME || 'admin').trim();

  const payload = await verifySessionToken(token, sessionSecret);
  if (payload && payload.isAdmin && checkIsAdmin(payload.username, adminUsername)) {
    return payload;
  }

  if (payload && !payload.isAdmin) {
    return new Response(JSON.stringify({ error: 'Forbidden: Admin access restricted' }), {
      status: 403,
      headers: { 'content-type': 'application/json' },
    });
  }

  return new Response(JSON.stringify({ error: 'Unauthorized: Invalid or expired token' }), {
    status: 401,
    headers: { 'content-type': 'application/json' },
  });
}
