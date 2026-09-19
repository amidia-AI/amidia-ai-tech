import { jsonResponse, readBody } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { kvDelete } from '../../_shared/kv';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { tokenId } = await readBody(context.request);
    if (!tokenId) return jsonResponse({ error: 'Token is required' }, 400);

    await kvDelete((context.env as any).APP_KV, 'kit_tokens', tokenId.trim());

    return jsonResponse({ success: true, message: 'Token deleted successfully' });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to delete token' }, 500);
  }
};
