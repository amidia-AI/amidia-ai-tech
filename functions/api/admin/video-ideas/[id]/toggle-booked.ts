import { jsonResponse, readBody } from '../../../../_shared/helpers';
import { requireAdmin } from '../../../../_shared/auth';
import { kvSet, kvGet } from '../../../../_shared/kv';

export const onRequestPatch: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const id = (context.params as any).id;
    const { isBooked } = await readBody(context.request);

    const kv = (context.env as any).APP_KV;
    let currentBooked: boolean;
    if (typeof isBooked === 'boolean') {
      currentBooked = isBooked;
    } else {
      const existing = await kvGet(kv, 'video_ideas', id);
      currentBooked = existing ? !Boolean(existing.isBooked) : true;
    }

    await kvSet(kv, 'video_ideas', id, { isBooked: currentBooked });

    return jsonResponse({ success: true, isBooked: currentBooked });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to update video idea booked status' }, 500);
  }
};
