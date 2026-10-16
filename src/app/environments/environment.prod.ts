export const environment = {
  production: true,
  keycloak: {
    issuer: 'http://localhost:8080/realms/hotel',
    clientId: 'hotel-ui',
    redirectUri: 'http://localhost:4200/callback',
    responseType: 'code',
    scope: 'openid profile email',
  },
  backendUrl: 'http://localhost:8081',
};
