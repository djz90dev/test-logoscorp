export function isValidCompany(companyName: string): boolean {
  const name = companyName.toLowerCase();
  return name.includes('group') || name.includes('inc.') || name.includes('llc');
}
