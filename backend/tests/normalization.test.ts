import { describe, it, expect } from 'vitest';
import { normalizePhone } from '../src/services/normalization.js';

describe('normalizePhone', () => {
  it('removes dashes', () => {
    expect(normalizePhone('123-456-7890')).toBe('1234567890');
  });

  it('removes dots', () => {
    expect(normalizePhone('123.456.7890')).toBe('1234567890');
  });

  it('removes parentheses', () => {
    expect(normalizePhone('(123) 456-7890')).toBe('1234567890');
  });

  it('removes extensions', () => {
    expect(normalizePhone('123-456-7890 ext. 123')).toBe('1234567890123');
  });

  it('removes spaces', () => {
    expect(normalizePhone('123 456 7890')).toBe('1234567890');
  });

  it('removes plus sign', () => {
    expect(normalizePhone('+1-234-567-8900')).toBe('12345678900');
  });

  it('handles complex format', () => {
    expect(normalizePhone('+1 (555) 123-4567 ext. 8')).toBe('155512345678');
  });

  it('keeps only digits', () => {
    expect(normalizePhone('abc123def456')).toBe('123456');
  });

  it('handles empty string', () => {
    expect(normalizePhone('')).toBe('');
  });
});
