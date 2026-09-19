export function stripHtml(str: string): string {
  let s = str;
  s = s.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F]/g, '');
  let prev = '';
  while (prev !== s) {
    prev = s;
    s = s.replace(/<[^>]*>?/g, '');
  }
  s = s.replace(/&lt;/gi, '<').replace(/&gt;/gi, '>').replace(/&amp;/gi, '&')
       .replace(/&quot;/gi, '"').replace(/&#x27;/gi, "'").replace(/&#x2F;/gi, '/');
  s = s.replace(/<[^>]*>?/g, '');
  s = s.replace(/javascript\s*:/gi, '')
       .replace(/vbscript\s*:/gi, '')
       .replace(/data\s*:/gi, '')
       .replace(/on\w+\s*=/gi, '');
  return s.trim();
}

export function randomHex(bytes: number): string {
  const buf = new Uint8Array(bytes);
  crypto.getRandomValues(buf);
  return Array.from(buf).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function jsonResponse(body: any, status = 200, extra: Record<string, string> = {}): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'content-type': 'application/json', ...extra },
  });
}

export async function readBody(request: Request): Promise<any> {
  try {
    return await request.json();
  } catch {
    return {};
  }
}
