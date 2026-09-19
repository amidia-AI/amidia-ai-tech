import { jsonResponse, randomHex } from '../../_shared/helpers';
import { firestoreGet, firestoreAdd, firestoreList } from '../../_shared/firestore';
import { DEFAULT_STUDIO_SCREENSHOTS } from '../../_shared/constants';

export const onRequestGet: PagesFunction = async (context) => {
  try {
    const token = ((context.params as any).token || '').trim();
    if (!token || token.length < 4) {
      return jsonResponse({ error: 'Not Found' }, 404);
    }

    let tokenData = await firestoreGet(context.env as any, 'kit_tokens', token);

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
    try { await firestoreAdd(context.env as any, 'kit_views', viewLog); } catch (e) {}

    let screenshots: any[] = [...DEFAULT_STUDIO_SCREENSHOTS];
    try {
      const remoteSnaps = await firestoreList(context.env as any, 'studio_screenshots');
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
      videoIdeas = await firestoreList(context.env as any, 'video_ideas');
    } catch (e) {}

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dynamicScreenshots = screenshots.map((s: any) => ({
      ...s,
      monthYear: currentMonthYear,
      dateRange: '',
    }));

    return jsonResponse({
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
    return jsonResponse({ error: 'Not Found' }, 404);
  }
};
