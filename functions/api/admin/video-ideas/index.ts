import { jsonResponse, readBody, stripHtml } from '../../../_shared/helpers';
import { requireAdmin } from '../../../_shared/auth';
import { kvList, kvAdd } from '../../../_shared/kv';

export const onRequestGet: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    let ideas: any[] = [];
    try { ideas = await kvList((context.env as any).APP_KV, 'video_ideas'); } catch (e) {}

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

    const id = await kvAdd((context.env as any).APP_KV, 'video_ideas', ideaDoc);

    return jsonResponse({ success: true, idea: { id, ...ideaDoc } });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to add video idea' }, 500);
  }
};
