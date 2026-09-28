// Detects whether a YouTube video is sponsored by looking for common
// sponsor-disclosure phrasing in its title/description, and extracts the
// brand name. Fully local heuristic, no network calls.

// An explicit "not sponsored" / "no sponsor" disclosure always wins, even if
// the word "sponsor" appears elsewhere (e.g. a gifted/no-strings-attached
// product that the creator explicitly discloses as unpaid).
const NOT_SPONSORED_RE = /\b(?:not|no|non[-\s]?)\s*sponsor(?:ed|ship)?\b/i;

const BRAND_GROUP = '([A-Za-z0-9][\\w&.\\-]*(?:\\s+[A-Za-z0-9][\\w&.\\-]*){0,3})';

// Patterns are tried in order; the first one that matches wins.
const SPONSOR_PATTERNS: RegExp[] = [
  new RegExp(`sponsored\\s+by[:\\s]+${BRAND_GROUP}`, 'i'),
  new RegExp(`paid\\s+partnership\\s+with[:\\s]+${BRAND_GROUP}`, 'i'),
  new RegExp(`in\\s+partnership\\s+with[:\\s]+${BRAND_GROUP}`, 'i'),
  new RegExp(`brought\\s+to\\s+you\\s+by[:\\s]+${BRAND_GROUP}`, 'i'),
  new RegExp(`thanks\\s+to\\s+${BRAND_GROUP}\\s+for\\s+sponsoring`, 'i'),
  // Timestamp/chapter-style disclosures, e.g. "3:44 CodeRabbit Sponsor"
  // or a standalone "CodeRabbit Sponsor" line.
  /(?:^|\n)\s*(?:\d{1,2}:\d{2}(?::\d{2})?\s+)?([A-Z][\w&.\-]*(?:\s+[A-Z][\w&.\-]*){0,2})\s+Sponsor(?:ed)?\b/m,
];

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

  if (NOT_SPONSORED_RE.test(combined)) {
    return { isSponsored: false };
  }

  for (const pattern of SPONSOR_PATTERNS) {
    const match = combined.match(pattern);
    if (!match) continue;
    const brandName = cleanBrandName(match[1]);
    if (brandName) {
      return { isSponsored: true, brandName };
    }
  }

  return { isSponsored: false };
}
