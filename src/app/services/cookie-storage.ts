import { OAuthStorage } from 'angular-oauth2-oidc';

export class CookieStorage implements OAuthStorage {
  getItem(key: string): string | null {
    const name = encodeURIComponent(key) + '=';
    const cookies = document.cookie ? document.cookie.split('; ') : [];
    for (const cookie of cookies) {
      if (cookie.indexOf(name) === 0) {
        return decodeURIComponent(cookie.substring(name.length));
      }
    }
    return null;
  }

  removeItem(key: string): void {
    this.writeCookie(encodeURIComponent(key), '', -1);
  }

  setItem(key: string, value: string): void {
    this.writeCookie(encodeURIComponent(key), encodeURIComponent(value), 3600);
  }

  private writeCookie(name: string, value: string, maxAgeSeconds: number): void {
    const secure = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = `${name}=${value}; path=/; max-age=${maxAgeSeconds}; SameSite=Lax${secure}`;
  }
}

export function oAuthStorageFactory(): OAuthStorage {
  return new CookieStorage();
}
