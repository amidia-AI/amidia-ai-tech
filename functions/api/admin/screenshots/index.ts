import { jsonResponse, readBody, stripHtml } from '../../../_shared/helpers';
import { requireAdmin } from '../../../_shared/auth';
import { kvList, kvAdd } from '../../../_shared/kv';
import { DEFAULT_STUDIO_SCREENSHOTS } from '../../../_shared/constants';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let screenshots: any[] = [];
    try { screenshots = await kvList((context.env as any).APP_KV, 'studio_screenshots'); } catch (e) {}

    for (const def of DEFAULT_STUDIO_SCREENSHOTS) {
      if (!screenshots.some((s) => s.id === def.id)) {
        screenshots.push(def);
      }
    }

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const dynamicScreenshots = screenshots.map((s: any) => ({
      ...s,
      monthYear: currentMonthYear,
      dateRange: '',
    }));

    return jsonResponse({ success: true, screenshots: dynamicScreenshots });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to fetch screenshots' }, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { label, imageUrl, category, monthYear } = await readBody(context.request);
    if (!imageUrl || !label) {
      return jsonResponse({ error: 'Label and image URL are required' }, 400);
    }

    const currentMonthYear = new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    const screenshotDoc = {
      monthYear: monthYear ? stripHtml(monthYear) : currentMonthYear,
      label: stripHtml(label),
      imageUrl,
      dateRange: '',
      category: category || 'demographics',
      createdAt: new Date().toISOString(),
    };

    const id = await kvAdd((context.env as any).APP_KV, 'studio_screenshots', screenshotDoc);

    return jsonResponse({ success: true, id });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to save screenshot' }, 500);
  }
};
