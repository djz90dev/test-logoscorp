import { describe, it, expect } from 'vitest';
import { mapUserToZohoContact } from '../src/services/mapUserToZohoContact.js';
import type { JsonPlaceholdeUser } from '../src/shared/types.js';

function makeUser(overrides: Partial<JsonPlaceholdeUser> = {}): JsonPlaceholdeUser {
  return {
    id: 1,
    name: 'Leanne Graham',
    username: 'Bret',
    email: 'leanne@example.com',
    phone: '1-770-736-8031',
    website: 'hildegard.org',
    company: {
      name: 'Acme Group',
      catchPhrase: 'Multi-layered',
      bs: 'harness',
    },
    ...overrides,
  };
}

describe('mapUserToZohoContact', () => {
  it('maps full name correctly', () => {
    const result = mapUserToZohoContact(makeUser());

    expect(result).toEqual({
      First_Name: 'Leanne',
      Last_Name: 'Graham',
      Email: 'leanne@example.com',
      Phone: '17707368031',
      Account_Name: 'Acme Group',
    });
  });

  it('handles single name (no space)', () => {
    const result = mapUserToZohoContact(makeUser({ name: 'Cher' }));

    expect(result.Last_Name).toBe('Cher');
    expect(result.First_Name).toBeUndefined();
  });

  it('handles multiple word names', () => {
    const result = mapUserToZohoContact(makeUser({ name: 'Mary Jane Watson' }));

    expect(result.First_Name).toBe('Mary Jane');
    expect(result.Last_Name).toBe('Watson');
  });

  it('handles empty name', () => {
    const result = mapUserToZohoContact(makeUser({ name: '' }));

    expect(result.Last_Name).toBe('Unknown');
    expect(result.First_Name).toBeUndefined();
  });

  it('handles whitespace-only name', () => {
    const result = mapUserToZohoContact(makeUser({ name: '   ' }));

    expect(result.Last_Name).toBe('Unknown');
  });

  it('strips non-digit characters from phone', () => {
    const result = mapUserToZohoContact(makeUser({ phone: '+1 (555) 123-4567' }));

    expect(result.Phone).toBe('15551234567');
  });

  it('omits Account_Name when company is missing', () => {
    const result = mapUserToZohoContact(
      makeUser({ company: { name: '', catchPhrase: '', bs: '' } })
    );

    expect(result.Account_Name).toBeUndefined();
    expect(result).not.toHaveProperty('Account_Name');
  });

  it('omits Account_Name when company.name is empty string', () => {
    const result = mapUserToZohoContact(
      makeUser({ company: { name: '', catchPhrase: '', bs: '' } })
    );

    expect(result).not.toHaveProperty('Account_Name');
  });

  it('does not include undefined or null values', () => {
    const result = mapUserToZohoContact(
      makeUser({ company: { name: '', catchPhrase: '', bs: '' } })
    );

    for (const value of Object.values(result)) {
      expect(value).not.toBeNull();
      expect(value).not.toBeUndefined();
    }
  });

  it('produces valid Zoho payload format', () => {
    const user = makeUser();
    const contact = mapUserToZohoContact(user);
    const payload = { data: [contact] };

    expect(payload.data).toHaveLength(1);
    expect(payload.data[0].Last_Name).toBeTruthy();
    expect(payload.data[0].Email).toBeTruthy();
    expect(payload.data[0].Phone).toBeTruthy();
  });
});
