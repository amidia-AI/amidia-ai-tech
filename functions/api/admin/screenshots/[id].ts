import { jsonResponse } from '../../../_shared/helpers';
import { requireAdmin } from '../../../_shared/auth';
import { firestoreDelete } from '../../../_shared/firestore';

export const onRequestDelete: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const id = (context.params as any).id;
    try { await firestoreDelete(context.env as any, 'studio_screenshots', id); } catch (e) {}
    return jsonResponse({ success: true });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to delete screenshot' }, 500);
  }
};
