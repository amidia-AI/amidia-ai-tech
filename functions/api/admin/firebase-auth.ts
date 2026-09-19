import { jsonResponse } from '../../_shared/helpers';

export const onRequestPost: PagesFunction = async () => {
  return jsonResponse({ error: 'Google sign-in is disabled. Please log in using username and password.' }, 403);
};
