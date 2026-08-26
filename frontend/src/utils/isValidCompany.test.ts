import { describe, it, expect } from 'vitest';
import { isValidCompany } from './isValidCompany';

describe('isValidCompany', () => {
  it('validates Group', () => {
    expect(isValidCompany('Acme Group')).toBe(true);
  });

  it('validates Inc.', () => {
    expect(isValidCompany('Tech Inc.')).toBe(true);
  });

  it('validates LLC', () => {
    expect(isValidCompany('Business LLC')).toBe(true);
  });

  it('rejects invalid company', () => {
    expect(isValidCompany('Romaguera-Crona')).toBe(false);
  });

  it('is case insensitive', () => {
    expect(isValidCompany('acme group')).toBe(true);
  });

  it('validates Company name → invalid to valid transition', () => {
    expect(isValidCompany('Some Corp')).toBe(false);
    expect(isValidCompany('Some Corp Group')).toBe(true);
  });
});
