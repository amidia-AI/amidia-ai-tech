// Fully local, in-browser heuristic parser for pulling a sender's name and
// company/brand name out of pasted email text. No network requests, no
// external AI/API calls — everything below runs synchronously on-device,
// using line/word tokenization rather than loose regex soup so casing and
// word boundaries stay predictable.

const GENERIC_GREETING_WORDS = new Set([
  'hi', 'hello', 'hey', 'dear', 'team', 'sir', 'madam', 'there', 'all',
  'everyone', 'folks', 'support', 'sales', 'admin', 'friend', 'guys', 'thanks',
  'thank', 'regards', 'best', 'sincerely', 'cheers',
]);

const FREE_EMAIL_DOMAINS = new Set([
  'gmail', 'googlemail', 'yahoo', 'ymail', 'hotmail', 'outlook', 'live',
  'msn', 'icloud', 'me', 'aol', 'proton', 'protonmail', 'gmx', 'zoho',
  'mail', 'yandex', 'rediffmail', 'inbox', 'fastmail', 'hey',
]);

const COMPANY_SUFFIXES = new Set([
  'inc', 'inc.', 'llc', 'ltd', 'ltd.', 'co', 'co.', 'corp', 'corp.',
  'corporation', 'company', 'studio', 'studios', 'media', 'agency', 'group',
  'labs', 'lab', 'technologies', 'tech', 'gmbh', 'plc', 'llp', 'pvt',
  'productions', 'production',
]);

const JOB_TITLE_WORDS = new Set([
  'ceo', 'cto', 'coo', 'cfo', 'founder', 'co-founder', 'president', 'director',
  'manager', 'marketing', 'sponsorship', 'partnerships', 'partnership', 'lead',
  'vp', 'owner', 'specialist', 'coordinator', 'executive', 'officer',
  'representative', 'rep', 'analyst', 'consultant', 'head',
]);

const SIGN_OFF_PHRASES = [
  'best regards', 'kind regards', 'warm regards', 'warmest regards',
  'many thanks', 'thank you', 'yours truly', 'yours sincerely', 'best wishes',
  'regards', 'thanks', 'sincerely', 'cheers', 'respectfully', 'best',
];

const INTRO_PHRASES = ["my name is", "this is", "i am", "i'm"];

const COMPANY_PHRASE_KEYWORDS = ['on behalf of', 'representing', 'at', 'with', 'for'];

function stripPunctuation(word: string): string {
  return word.replace(/^[^A-Za-z0-9]+|[^A-Za-z0-9.]+$/g, '');
}

function isCapitalizedWord(word: string): boolean {
  const w = stripPunctuation(word);
  if (!w) return false;
  if (/\d/.test(w)) return false;
  if (!/^[A-Z]/.test(w)) return false;
  const lower = w.toLowerCase().replace(/\.$/, '');
  if (GENERIC_GREETING_WORDS.has(lower)) return false;
  if (JOB_TITLE_WORDS.has(lower)) return false;
  return true;
}

function tokenizeLine(line: string): string[] {
  return line.trim().split(/\s+/).filter(Boolean);
}

function grabForwardCapitalizedWords(tokens: string[], startIdx: number, maxWords: number): string[] {
  const out: string[] = [];
  for (let i = startIdx; i < tokens.length && out.length < maxWords; i++) {
    if (!isCapitalizedWord(tokens[i])) break;
    const stripped = stripPunctuation(tokens[i]);
    const endsSentence = /\.$/.test(stripped);
    out.push(endsSentence ? stripped.slice(0, -1) : stripped);
    if (endsSentence) break;
  }
  return out;
}

function grabBackwardCapitalizedWords(tokens: string[], beforeIdx: number, maxWords: number): string[] {
  const out: string[] = [];
  for (let i = beforeIdx - 1; i >= 0 && out.length < maxWords; i--) {
    if (!isCapitalizedWord(tokens[i])) break;
    out.unshift(stripPunctuation(tokens[i]));
  }
  return out;
}

function joinValidPhrase(words: string[], minWords = 1, maxWords = 3): string {
  if (words.length < minWords || words.length > maxWords) return '';
  return words.join(' ');
}

function titleCase(word: string): string {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function extractEmailAddress(text: string): string {
  const m = text.match(/[\w.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/);
  return m ? m[0] : '';
}

function extractEmailDomainCompany(text: string): string {
  const email = extractEmailAddress(text);
  if (!email) return '';
  const domainMatch = email.match(/@([a-zA-Z0-9-]+)\./);
  if (!domainMatch) return '';
  const domain = domainMatch[1].toLowerCase();
  if (FREE_EMAIL_DOMAINS.has(domain)) return '';
  return titleCase(domain);
}

export function extractContactName(text: string): string {
  const cleaned = text.replace(/\r\n/g, '\n');
  const lines = cleaned.split('\n');

  for (const line of lines) {
    const labelMatch = line.match(/^\s*(?:name|full name|contact name|contact)\s*[:\-]\s*(.+)$/i);
    if (labelMatch) {
      const candidate = joinValidPhrase(tokenizeLine(labelMatch[1]).map(stripPunctuation), 1, 3);
      if (candidate && isCapitalizedWord(candidate.split(' ')[0])) return candidate;
    }
  }

  const fromHeaderLine = lines.find((l) => /^From:/i.test(l.trim()));
  if (fromHeaderLine) {
    const withoutLabel = fromHeaderLine.replace(/^From:\s*/i, '');
    const withoutEmail = withoutLabel.replace(/<[^>]*>/, '').trim();
    const candidate = joinValidPhrase(tokenizeLine(withoutEmail).map(stripPunctuation), 1, 3);
    if (candidate) return candidate;
  }

  for (const line of lines) {
    const lower = line.toLowerCase();
    for (const phrase of INTRO_PHRASES) {
      const idx = lower.indexOf(phrase);
      if (idx === -1) continue;
      const afterText = line.slice(idx + phrase.length);
      const tokens = tokenizeLine(afterText);
      const candidate = grabForwardCapitalizedWords(tokens, 0, 3);
      const joined = joinValidPhrase(candidate, 1, 3);
      if (joined) return joined;
    }
  }

  let lastSignOffCandidate = '';
  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim().replace(/[,!.]+$/, '');
    const lowerTrimmed = trimmed.toLowerCase();
    if (SIGN_OFF_PHRASES.includes(lowerTrimmed)) {
      for (let j = i + 1; j < lines.length; j++) {
        const nextLine = lines[j].trim();
        if (!nextLine) continue;
        const tokens = tokenizeLine(nextLine);
        const candidate = grabForwardCapitalizedWords(tokens, 0, 3);
        const joined = joinValidPhrase(candidate, 1, 3);
        if (joined && candidate.length === tokens.length) lastSignOffCandidate = joined;
        break;
      }
    }
  }
  if (lastSignOffCandidate) return lastSignOffCandidate;

  for (const line of lines) {
    if (!line.includes('|')) continue;
    const segments = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (segments.length < 2) continue;
    const tokens = tokenizeLine(segments[0]);
    const candidate = grabForwardCapitalizedWords(tokens, 0, 3);
    const joined = joinValidPhrase(candidate, 1, 3);
    if (joined && candidate.length === tokens.length) return joined;
  }

  const domainCompany = extractEmailDomainCompany(cleaned);
  const email = extractEmailAddress(cleaned);
  if (email) {
    const localPart = email.split('@')[0];
    const parts = localPart.split(/[._-]+/).filter((p) => p.length > 1 && !/^\d+$/.test(p));
    if (parts.length >= 2) {
      const candidate = parts.slice(0, 2).map(titleCase).join(' ');
      if (candidate.toLowerCase() !== domainCompany.toLowerCase()) return candidate;
    }
  }

  return '';
}

export function extractCompanyName(text: string): string {
  const cleaned = text.replace(/\r\n/g, '\n');
  const lines = cleaned.split('\n');

  for (const line of lines) {
    const labelMatch = line.match(/^\s*(?:company|company name|organization|organisation|brand|business|brand name)\s*[:\-]\s*(.+)$/i);
    if (labelMatch) {
      const candidate = joinValidPhrase(tokenizeLine(labelMatch[1]).map(stripPunctuation), 1, 5);
      if (candidate) return candidate;
    }
  }

  const handleMatch = cleaned.match(/@([A-Z][A-Za-z0-9]*)\b/);
  if (handleMatch) return handleMatch[1];

  for (const line of lines) {
    const tokens = tokenizeLine(line);
    for (let i = 0; i < tokens.length; i++) {
      const bare = stripPunctuation(tokens[i]).toLowerCase().replace(/\.$/, '');
      if (!COMPANY_SUFFIXES.has(bare)) continue;
      const preceding = grabBackwardCapitalizedWords(tokens, i, 3);
      if (preceding.length === 0) continue;
      const candidate = [...preceding, stripPunctuation(tokens[i])].join(' ');
      return candidate;
    }
  }

  for (const line of lines) {
    const tokens = tokenizeLine(line);
    const lowerTokens = tokens.map((t) => stripPunctuation(t).toLowerCase());
    for (const phrase of COMPANY_PHRASE_KEYWORDS) {
      const phraseWords = phrase.split(' ');
      for (let i = 0; i <= lowerTokens.length - phraseWords.length; i++) {
        const slice = lowerTokens.slice(i, i + phraseWords.length);
        if (slice.join(' ') !== phrase) continue;
        const afterIdx = i + phraseWords.length;
        const candidateWords = grabForwardCapitalizedWords(tokens, afterIdx, 3);
        const joined = joinValidPhrase(candidateWords, 1, 4);
        if (joined) return joined;
      }
    }
  }

  for (const line of lines) {
    if (!line.includes('|')) continue;
    const segments = line.split('|').map((s) => s.trim()).filter(Boolean);
    if (segments.length < 2) continue;
    const last = segments[segments.length - 1];
    const tokens = tokenizeLine(last);
    const candidate = grabForwardCapitalizedWords(tokens, 0, 5);
    const joined = joinValidPhrase(candidate, 1, 5);
    if (joined && candidate.length === tokens.length) return joined;
  }

  return extractEmailDomainCompany(cleaned);
}

export function extractContactInfo(text: string): { contactName: string; companyName: string } {
  return {
    contactName: extractContactName(text),
    companyName: extractCompanyName(text),
  };
}
