// Detects whether a YouTube video is sponsored by looking for a
// "sponsored by <brand>" mention in its title/description, and extracts
// the brand name. Fully local heuristic, no network calls.

const SPONSORED_BY_RE = /sponsored\s+by[:\s]+([A-Za-z0-9][\w&.\-]*(?:\s+[A-Za-z0-9][\w&.\-]*){0,3})/i;

// Stops the captured brand name at the first line break, sentence-ending
// punctuation, or common trailing separator so we don't swallow the rest
// of the description into the "brand name".
function cleanBrandName(raw: string): string {
  return raw
    .split(/[\n\r.,!?|•\-–—]|https?:\/\//i)[0]
    .trim()
    .replace(/\s+/g, ' ');
}

export interface SponsorDetectionResult {
  isSponsored: boolean;
  brandName?: string;
}

export function detectSponsorFromDescription(
  description: string | undefined | null,
  title?: string | null,
): SponsorDetectionResult {
  const combined = `${title ?? ''}\n${description ?? ''}`;
  const match = combined.match(SPONSORED_BY_RE);

  if (!match) {
    return { isSponsored: false };
  }

  const brandName = cleanBrandName(match[1]);
  if (!brandName) {
    return { isSponsored: false };
  }

  return { isSponsored: true, brandName };
}
