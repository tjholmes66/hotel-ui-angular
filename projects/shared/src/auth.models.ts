export interface UserInfo {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  keycloakId: string;
  roles: string[];
}

export type Portal = 'guest' | 'staff';

export const GUEST_ROLE = 'ROLE_GUEST';

// Known staff roles. Any non-GUEST role is treated as staff, so this list is
// mainly useful for building staff menus.
export const STAFF_ROLES = [
  'ROLE_ADMIN',
  'ROLE_BELLHOP',
  'ROLE_CONCIERGE',
  'ROLE_FRONT-DESK',
  'ROLE_HOUSEKEEPING',
  'ROLE_KITCHEN',
  'ROLE_MAINTENANCE',
  'ROLE_PORTER',
] as const;

export function normalizeRole(role: string): string {
  const upper = role.trim().toUpperCase();
  return upper.startsWith('ROLE_') ? upper : `ROLE_${upper}`;
}

export function getUserRoles(user: UserInfo | null | undefined): string[] {
  return (user?.roles ?? []).map(normalizeRole);
}

export function hasRole(user: UserInfo | null | undefined, role: string): boolean {
  return getUserRoles(user).includes(normalizeRole(role));
}

export function isGuest(user: UserInfo | null | undefined): boolean {
  return hasRole(user, GUEST_ROLE);
}

export function isStaff(user: UserInfo | null | undefined): boolean {
  return getUserRoles(user).some((role) => role !== GUEST_ROLE);
}

/**
 * Staff roles win over GUEST. Any authenticated user without a guest role is
 * treated as staff so that new staff roles do not end up in the guest portal.
 */
export function resolvePortal(user: UserInfo | null | undefined): Portal | null {
  if (!user) {
    return null;
  }

  if (isStaff(user)) {
    return 'staff';
  }

  return 'guest';
}
