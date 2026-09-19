import { jsonResponse, readBody, randomHex } from '../../_shared/helpers';
import { requireAdmin } from '../../_shared/auth';
import { firestoreAdd } from '../../_shared/firestore';

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { type, title, description, coverTag, checklist } = await readBody(context.request);
    if (!type || !title || !description) {
      return jsonResponse({ error: 'Missing required content fields' }, 400);
    }

    const docData: any = {
      type,
      title,
      description,
      coverTag: coverTag || 'AI & Tech',
      createdAt: new Date().toISOString(),
    };

    if (type === 'challenge' && Array.isArray(checklist)) {
      docData.checklist = checklist.map((step: any) => typeof step === 'string' ? { step, done: false } : step);
    }

    let docId = randomHex(8);
    try { docId = await firestoreAdd('content', docData); } catch (e) {}

    return jsonResponse({ success: true, id: docId });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to publish content' }, 500);
  }
};
