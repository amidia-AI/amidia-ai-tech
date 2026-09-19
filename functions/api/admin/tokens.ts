import { jsonResponse } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { firestoreList } from '../../_shared/firestore';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let tokens: any[] = [];
    try { tokens = await firestoreList('kit_tokens'); } catch (e) {}

    tokens.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    return jsonResponse({ success: true, tokens });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to fetch tokens' }, 500);
  }
};
