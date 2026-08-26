import { describe, it, expect } from 'vitest';
import { validateCompany } from '../src/services/normalization.js';

describe('validateCompany', () => {
  it('validates Group', () => {
    expect(
      validateCompany({ name: 'Acme Group', catchPhrase: '', bs: '' })
    ).toBe(true);
  });

  it('validates Inc.', () => {
    expect(
      validateCompany({ name: 'Tech Inc.', catchPhrase: '', bs: '' })
    ).toBe(true);
  });

  it('validates LLC', () => {
    expect(
      validateCompany({ name: 'Business LLC', catchPhrase: '', bs: '' })
    ).toBe(true);
  });

  it('invalid company', () => {
    expect(
      validateCompany({ name: 'Romaguera-Crona', catchPhrase: '', bs: '' })
    ).toBe(false);
  });

  it('case insensitive', () => {
    expect(
      validateCompany({ name: 'acme group', catchPhrase: '', bs: '' })
    ).toBe(true);
  });

  it('validates Group in mixed case', () => {
    expect(
      validateCompany({ name: 'ACME Group Inc', catchPhrase: '', bs: '' })
    ).toBe(true);
  });
});
