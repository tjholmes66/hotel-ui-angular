/**
 * Dev proxy for the Hotel BFF.
 *
 * Keeping /api, /oauth2, /login and /logout same-origin is what makes the
 * HttpOnly JSESSIONID cookie and the XSRF-TOKEN cookie work without CORS.
 *
 * Override the BFF location with HOTEL_BFF_URL when it is not on :8080.
 */
const bffTarget = process.env.HOTEL_BFF_URL || 'http://localhost:8080';

const bffProxy = {
  target: bffTarget,
  changeOrigin: false,
  secure: false,
  ws: false,
};

module.exports = {
  '/api': { ...bffProxy },
  '/oauth2': { ...bffProxy },
  '/logout': { ...bffProxy },
  '/login': {
    ...bffProxy,
    /**
     * /login?error (BFF OAuth failure) and the Angular login route must be
     * rendered by Angular. Only Spring Security's OAuth2 callback,
     * /login/oauth2/**, belongs to the BFF.
     */
    bypass(req) {
      const isLoginCallback = req.url.startsWith('/login/oauth2');
      const acceptsHtml = (req.headers.accept || '').includes('text/html');

      if (req.method === 'GET' && !isLoginCallback && acceptsHtml) {
        return '/index.html';
      }

      return undefined;
    },
  },
};
