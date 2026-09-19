import { jsonResponse } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { kvList } from '../../_shared/kv';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let logs: any[] = [];
    try { logs = await kvList((context.env as any).APP_KV, 'kit_views'); } catch (e) {}

    logs.sort((a: any, b: any) => {
      const timeA = new Date(a.openedAt).getTime() || 0;
      const timeB = new Date(b.openedAt).getTime() || 0;
      return timeB - timeA;
    });

    return jsonResponse({ success: true, logs });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to fetch logs' }, 500);
  }
};
