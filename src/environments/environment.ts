import { AuthConfig } from 'angular-oauth2-oidc';

export const environment = {
  production: false,
  keycloak: {
    issuer: 'http://localhost:9000/realms/hotel_realm',
    clientId: 'hotel_client',
    redirectUri: 'http://localhost:4200/callback',
    postLogoutRedirectUri: 'http://localhost:4200/',
    responseType: 'code',
    scope: 'openid profile email',
    showDebugInformation: true,
    requireHttps: false,
    strictDiscoveryDocumentValidation: false,
  } satisfies AuthConfig,
  backendUrl: 'http://localhost:8081',
};
