import { jsonResponse, readBody, stripHtml, randomHex } from '../../../_shared/helpers';
import { requireAdmin } from '../../../_shared/auth';
import { firestoreList, firestoreAdd } from '../../../_shared/firestore';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let ideas: any[] = [];
    try { ideas = await firestoreList(context.env as any, 'video_ideas'); } catch (e) {}

    ideas.sort((a: any, b: any) => {
      const timeA = new Date(a.createdAt).getTime() || 0;
      const timeB = new Date(b.createdAt).getTime() || 0;
      return timeB - timeA;
    });

    return jsonResponse({ success: true, ideas });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to fetch video ideas' }, 500);
  }
};

export const onRequestPost: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const { title, description, isBooked } = await readBody(context.request);
    if (!title || !title.trim()) {
      return jsonResponse({ error: 'Video title is required' }, 400);
    }

    const ideaDoc = {
      title: stripHtml(title.trim()),
      description: stripHtml((description || '').trim()),
      isBooked: Boolean(isBooked),
      createdAt: new Date().toISOString(),
    };

    let id = randomHex(8);
    try { id = await firestoreAdd(context.env as any, 'video_ideas', ideaDoc); } catch (e) {}

    return jsonResponse({ success: true, idea: { id, ...ideaDoc } });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to add video idea' }, 500);
  }
};
