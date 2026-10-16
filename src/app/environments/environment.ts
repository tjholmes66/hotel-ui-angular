export const environment = {
  production: false,
  keycloak: {
    issuer: 'http://localhost:8080/realms/hotel', // Keycloak realm issuer URL
    clientId: 'hotel-ui',
    redirectUri: 'http://localhost:4200/callback',
    responseType: 'code',
    scope: 'openid profile email',
  },
  backendUrl: 'http://localhost:8081', // hotel-be-bff-springboot URL
};
