import { getUserRoles, GUEST_ROLE, Portal, UserInfo } from './auth.models';

export interface MenuItem {
  label: string;
  path: string;
}

export interface MenuSection {
  header: string;
  role: string;
  items: MenuItem[];
}

function feature(slug: string, label: string): MenuItem {
  return { label, path: `/feature/${slug}` };
}

const ROLE_MENUS: Record<string, MenuItem[]> = {
  ROLE_ADMIN: [
    feature('check-in', 'Check in guest'),
    feature('check-out', 'Check out guest'),
    feature('manage-users', 'Manage users'),
    feature('reports', 'Reports'),
  ],
  ROLE_BELLHOP: [
    feature('luggage-requests', 'Luggage requests'),
    feature('guest-assistance', 'Guest assistance'),
  ],
  ROLE_CONCIERGE: [
    feature('check-in', 'Check in guest'),
    feature('check-out', 'Check out guest'),
    feature('guest-requests', 'Guest requests'),
    feature('dining-transport', 'Dining and transport'),
  ],
  'ROLE_FRONT-DESK': [
    feature('check-in', 'Check in guest'),
    feature('check-out', 'Check out guest'),
    feature('guest-lookup', 'Guest lookup'),
    feature('reservations', 'Reservations'),
  ],
  ROLE_HOUSEKEEPING: [
    feature('room-status', 'Room status'),
    feature('cleaning-assignments', 'Cleaning assignments'),
  ],
  ROLE_KITCHEN: [feature('orders', 'Orders'), feature('menu-availability', 'Menu availability')],
  ROLE_MAINTENANCE: [
    feature('work-orders', 'Work orders'),
    feature('room-maintenance', 'Room maintenance'),
  ],
  ROLE_PORTER: [feature('guest-assistance', 'Guest assistance'), feature('transfers', 'Transfers')],
};

export const GUEST_MENU: MenuSection[] = [
  {
    header: 'Guest',
    role: GUEST_ROLE,
    items: [
      feature('my-reservation', 'My reservation'),
      feature('online-check-in', 'Online check-in'),
      feature('guest-services', 'Guest services'),
    ],
  },
];

export function roleLabel(role: string): string {
  return role
    .replace(/^ROLE_/, '')
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function featureTitle(slug: string | null): string {
  if (!slug) {
    return 'Overview';
  }

  return slug
    .replace(/[-_]+/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function buildMenuSections(portal: Portal, user: UserInfo | null): MenuSection[] {
  if (portal === 'guest') {
    return GUEST_MENU;
  }

  const roles = [...new Set(getUserRoles(user).filter((role) => role !== GUEST_ROLE))];

  if (roles.length === 0) {
    return [{ header: 'Staff', role: 'STAFF', items: [feature('dashboard', 'Dashboard')] }];
  }

  return roles.map((role) => ({
    header: roleLabel(role),
    role,
    items: ROLE_MENUS[role] ?? [feature('dashboard', 'Dashboard')],
  }));
}
