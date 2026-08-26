import type { JsonPlaceholdeUser, NormalizedUser } from '../shared/types.js';

export function normalizePhone(phone: string): string {
  return phone.replace(/[^0-9]/g, '');
}

export function normalizeWebsite(website: string): string {
  if (!website) return website;
  if (website.startsWith('http://') || website.startsWith('https://')) {
    return website;
  }
  return `https://${website}`;
}

export function validateCompany(
  company: { name: string; catchPhrase: string; bs: string }
): boolean {
  const name = company.name.toLowerCase();
  return name.includes('group') || name.includes('inc.') || name.includes('llc');
}

export function normalizeUser(user: JsonPlaceholdeUser): NormalizedUser {
  return {
    ...user,
    normalizedPhone: normalizePhone(user.phone),
    normalizedWebsite: normalizeWebsite(user.website),
    isValidCompany: validateCompany(user.company),
  };
}

export function normalizeUsers(users: JsonPlaceholdeUser[]): NormalizedUser[] {
  return users.map(normalizeUser);
}
