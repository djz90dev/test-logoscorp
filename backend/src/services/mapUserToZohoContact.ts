import type { JsonPlaceholdeUser, ZohoContact } from '../shared/types.js';

function parseName(fullName: string): { firstName?: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/);
  if (parts.length === 0 || parts[0] === '') {
    return { lastName: 'Unknown' };
  }
  if (parts.length === 1) {
    return { lastName: parts[0] };
  }
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts[parts.length - 1],
  };
}

export function mapUserToZohoContact(user: JsonPlaceholdeUser): ZohoContact {
  const { firstName, lastName } = parseName(user.name);

  const contact: ZohoContact = {
    Last_Name: lastName,
    Email: user.email,
    Phone: user.phone.replace(/[^0-9]/g, ''),
  };

  if (firstName) {
    contact.First_Name = firstName;
  }

  if (user.company?.name) {
    contact.Account_Name = user.company.name;
  }

  return contact;
}
