import { buildMenuSections, roleLabel, UserInfo } from '@hotel/shared';

const user: UserInfo = {
  username: 'staff1',
  email: 'staff1@example.com',
  firstName: 'Staff',
  lastName: 'User',
  keycloakId: 'keycloak-staff',
  roles: ['ROLE_FRONT-DESK', 'ROLE_CONCIERGE'],
};

function labels(items: { label: string }[]): string[] {
  return items.map((item) => item.label);
}

describe('portal menu', () => {
  it('builds the guest menu with the guest role header', () => {
    const sections = buildMenuSections('guest', {
      ...user,
      roles: ['ROLE_GUEST'],
    });

    expect(sections).toHaveLength(1);
    expect(sections[0].header).toBe('Guest');
    expect(labels(sections[0].items)).toEqual([
      'My reservation',
      'Online check-in',
      'Guest services',
    ]);
  });

  it('creates one section per staff role', () => {
    const sections = buildMenuSections('staff', user);

    expect(sections.map((section) => section.header)).toEqual(['Front Desk', 'Concierge']);
  });

  it('gives front desk, concierge and admin check-in and check-out functions', () => {
    for (const role of ['ROLE_FRONT-DESK', 'ROLE_CONCIERGE', 'ROLE_ADMIN']) {
      const section = buildMenuSections('staff', { ...user, roles: [role] })[0];

      expect(labels(section.items)).toContain('Check in guest');
      expect(labels(section.items)).toContain('Check out guest');
    }
  });

  it('does not add a guest section to the staff menu', () => {
    const sections = buildMenuSections('staff', {
      ...user,
      roles: ['ROLE_GUEST', 'ROLE_HOUSEKEEPING'],
    });

    expect(sections.map((section) => section.header)).toEqual(['Housekeeping']);
  });

  it('falls back to a dashboard for an unknown staff role', () => {
    const sections = buildMenuSections('staff', { ...user, roles: ['ROLE_MANAGER'] });

    expect(sections).toEqual([
      {
        header: 'Manager',
        role: 'ROLE_MANAGER',
        items: [{ label: 'Dashboard', path: '/feature/dashboard' }],
      },
    ]);
  });

  it('formats role names for display', () => {
    expect(roleLabel('ROLE_FRONT-DESK')).toBe('Front Desk');
    expect(roleLabel('ROLE_HOUSEKEEPING')).toBe('Housekeeping');
  });
});
