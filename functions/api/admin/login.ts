import { jsonResponse, readBody } from '../../_shared/helpers';
import { createSessionToken, checkIsAdmin } from '../../_shared/auth';

export const onRequestPost: PagesFunction = async (context) => {
  try {
    const { username, password } = await readBody(context.request);
    if (!username || !password) {
      return jsonResponse({ error: 'Username and password are required' }, 400);
    }

    const adminPassword = (context.env as any).ADMIN_PASSWORD || '';
    const adminUsername = ((context.env as any).ADMIN_USERNAME || 'admin').trim();

    if (!adminPassword) {
      return jsonResponse({
        error: 'Administrator login is not configured on this server. Set ADMIN_PASSWORD in the environment.',
      }, 503);
    }

    const inputUser = String(username).trim();
    const isAuthorizedUser = checkIsAdmin(inputUser, adminUsername);
    const isPasswordValid = String(password).trim() === adminPassword.trim();

    if (isAuthorizedUser && isPasswordValid) {
      const payload = {
        uid: 'admin_master',
        username: inputUser,
        displayName: 'Administrator',
        isAdmin: true as const,
      };
      const sessionSecret = (context.env as any).SESSION_SECRET || 'fallback-secret';
      const token = await createSessionToken(payload, sessionSecret);
      return jsonResponse({
        success: true,
        token,
        user: {
          username: inputUser,
          displayName: 'Administrator',
          isAdmin: true,
        },
      });
    }

    return jsonResponse({ error: 'Invalid username or password.' }, 401);
  } catch (err: any) {
    return jsonResponse({ error: 'Authentication service error' }, 500);
  }
};
