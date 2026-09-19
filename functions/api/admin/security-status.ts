import { jsonResponse } from '../../_shared/helpers';

export const onRequestGet: PagesFunction = async () => {
  return jsonResponse({
    success: true,
    authMethod: 'Username & Password Only',
    securityPolicy: 'Strict Administrator Credential Authentication',
    status: 'Enforced',
  });
};
