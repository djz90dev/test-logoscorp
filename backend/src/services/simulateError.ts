export function shouldSimulateError(username: string): boolean {
  return username.toUpperCase().startsWith('C');
}
