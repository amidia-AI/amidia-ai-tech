import { jsonResponse, readBody } from '../../../../_shared/helpers';
import { requireAdmin } from '../../../../_shared/auth';
import { firestoreSet, firestoreGet } from '../../../../_shared/firestore';

export const onRequestPatch: PagesFunction = async (context) => {
  const auth = await requireAdmin(context.request, context.env);
  if (auth instanceof Response) return auth;

  try {
    const id = (context.params as any).id;
    const { isBooked } = await readBody(context.request);

    let currentBooked: boolean;
    if (typeof isBooked === 'boolean') {
      currentBooked = isBooked;
    } else {
      const existing = await firestoreGet('video_ideas', id);
      currentBooked = existing ? !Boolean(existing.isBooked) : true;
    }

    try { await firestoreSet('video_ideas', id, { isBooked: currentBooked }); } catch (e) {}

    return jsonResponse({ success: true, isBooked: currentBooked });
  } catch (err: any) {
    return jsonResponse({ error: err.message || 'Failed to update video idea booked status' }, 500);
  }
};
