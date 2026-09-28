import { jsonResponse } from '../../_shared/helpers';
import { kvGet, kvAdd, kvList } from '../../_shared/kv';
import { DEFAULT_STUDIO_SCREENSHOTS } from '../../_shared/constants';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const token = ((context.params as any).token || '').trim();
    if (!token || token.length < 4) {
      return jsonResponse({ error: 'Not Found' }, 404);
    }

    const kv = (context.env as any).APP_KV;
    let tokenData = await kvGet(kv, 'kit_tokens', token);

    if (!tokenData || tokenData.revoked) {
      return jsonResponse({ error: 'Not Found' }, 404);
    }

    if (tokenData.expiresAt) {
      const expTime = new Date(tokenData.expiresAt).getTime();
      if (!isNaN(expTime) && expTime < Date.now()) {
        return jsonResponse({ error: 'Not Found' }, 404);
      }
    }

    const viewLog = {
      token,
      brandName: tokenData.brandName || tokenData.company || 'Unknown Brand',
      company: tokenData.company || '',
      openedAt: new Date().toISOString(),
      userAgent: context.request.headers.get('user-agent') || 'Unknown User-Agent',
      ip: context.request.headers.get('cf-connecting-ip') || context.request.headers.get('x-forwarded-for') || '0.0.0.0',
    };
    try { await kvAdd(kv, 'kit_views', viewLog); } catch (e) {}

    let screenshots: any[] = [...DEFAULT_STUDIO_SCREENSHOTS];
    try {
      const remoteSnaps = await kvList(kv, 'studio_screenshots');
      if (remoteSnaps.length > 0) {
        for (const r of remoteSnaps) {
          if (!screenshots.some((s) => s.id === r.id || s.imageUrl === r.imageUrl)) {
            screenshots.push(r);
          }
        }
      }
    } catch (e) {}

    let videoIdeas: any[] = [];
    try {
      videoIdeas = await kvList(kv, 'video_ideas');
    } catch (e) {}

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dynamicScreenshots = screenshots.map((s: any) => ({
      ...s,
      monthYear: currentMonthYear,
      dateRange: '',
    }));

    const lineItems = Array.isArray(tokenData.lineItems) && tokenData.lineItems.length > 0
      ? tokenData.lineItems.filter((li: any) => li.enabled !== false)
      : [
          { id: 'dedicated', key: 'dedicated', label: 'Dedicated Deep-Dive Video', description: 'A standalone 10–18 minute comprehensive build or review focusing 100% on your developer tool, SDK, or AI workflow.', price: tokenData.dedicatedPrice || 1200, unitLabel: 'flat rate per produced video', badge: 'Full Feature', enabled: true },
          { id: 'shots', key: 'shots', label: 'Shots Package', description: 'A bundle of short-form vertical shots/clips (Reels, Shorts, TikTok-style cuts) featuring your product for fast, high-frequency visibility.', price: 150, quantity: 5, unitLabel: 'per shot', badge: 'Short-Form', enabled: true },
          { id: 'integrated', key: 'integrated', label: 'Integrated Segment (60–90s)', description: 'A seamless mid-roll or organic problem-solving showcase embedded directly into a major architectural tutorial.', price: tokenData.integratedPrice || 600, unitLabel: 'flat rate per segment placement', badge: 'High Impact', enabled: true },
          { id: 'adRead', key: 'adRead', label: 'Ad Read / Sponsored Mention', description: 'A scripted, straight-to-camera or voiceover ad read/shoutout naturally worked into the video, separate from a full product segment.', price: 400, unitLabel: 'flat rate per ad read', badge: 'Sponsored', enabled: true },
        ];

    return jsonResponse({
      success: true,
      brandName: tokenData.brandName || tokenData.company,
      company: tokenData.company,
      preparedMonthYear: currentMonthYear,
      expiresAt: tokenData.expiresAt,
      screenshots: dynamicScreenshots,
      videoIdeas,
      lineItems,
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
    return jsonResponse({ error: 'Not Found' }, 404);
  }
};
