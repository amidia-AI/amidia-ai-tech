import { jsonResponse } from '../../../../_shared/helpers';
import { requireAdmin } from '../../../../_shared/auth';
import { kvDelete } from '../../../../_shared/kv';

export const onRequestDelete: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const id = (context.params as any).id;
    await kvDelete((context.env as any).APP_KV, 'video_ideas', id);
    return jsonResponse({ success: true });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to delete video idea' }, 500);
  }
};
