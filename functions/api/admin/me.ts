import { jsonResponse } from '../../_shared/helpers';
import { verifySessionToken, checkIsAdmin } from '../../_shared/auth';

export const onRequestGet: PagesFunction = async (context) => {
  const authHeader = context.request.headers.get('authorization') || '';
  if (!authHeader.startsWith('Bearer ')) {
    return jsonResponse({ error: 'Unauthorized: No token provided' }, 401);
  }
  const token = authHeader.slice(7);
  const sessionSecret = (context.env as any).SESSION_SECRET || '';
  const adminUsername = ((context.env as any).ADMIN_USERNAME || 'admin').trim();

  const payload = await verifySessionToken(token, sessionSecret);
  if (payload && payload.isAdmin && checkIsAdmin(payload.username, adminUsername)) {
    return jsonResponse({
      success: true,
      user: {
        uid: payload.uid,
        username: payload.username,
        displayName: payload.displayName || 'Administrator',
        isAdmin: true,
      },
    });
  }
  return jsonResponse({ error: 'Unauthorized: Session invalid or expired' }, 401);
};
