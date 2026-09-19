import { jsonResponse } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { firestoreList } from '../../_shared/firestore';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let submissions: any[] = [];
    try { submissions = await firestoreList('kit_submissions'); } catch (e) {}

    submissions.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    return jsonResponse({ success: true, submissions });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to fetch submissions' }, 500);
  }
};
