import { jsonResponse, readBody } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { firestoreDelete } from '../../_shared/firestore';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { tokenId } = await readBody(context.request);
    if (!tokenId) return jsonResponse({ error: 'Token is required' }, 400);

    try { await firestoreDelete(context.env as any, 'kit_tokens', tokenId.trim()); } catch (e) {}

    return jsonResponse({ success: true, message: 'Token deleted successfully' });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to delete token' }, 500);
  }
};
