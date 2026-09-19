import { jsonResponse } from '../../_shared/helpers';

// Sessions are stateless JWTs (no server-side session store), matching the
// original server.ts design which had no /api/admin/logout route either.
// The actual "logout" is the client discarding its token; this endpoint just
// gives the frontend a clean success response to call when doing so.
export const onRequestPost: PagesFunction = async () => {
  return jsonResponse({ success: true, message: 'Logged out' });
};
