export const onRequest: PagesFunction = async (context) => {
  const response = await context.next();
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-DNS-Prefetch-Control', 'off');
  response.headers.set('X-Download-Options', 'noopen');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('X-Permitted-Cross-Domain-Policies', 'none');
  response.headers.set('X-XSS-Protection', '0');
  response.headers.set('Referrer-Policy', 'no-referrer');
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://*.firebaseapp.com https://*.gstatic.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; img-src 'self' data: blob: https://*; connect-src 'self' https://*; font-src 'self' https://fonts.gstatic.com data:; object-src 'none'; upgrade-insecure-requests; frame-ancestors *"
  );
  return response;
};
