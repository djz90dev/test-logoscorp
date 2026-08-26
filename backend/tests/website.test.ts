import { describe, it, expect } from 'vitest';
import { normalizeWebsite } from '../src/services/normalization.js';

describe('normalizeWebsite', () => {
  it('adds https when missing', () => {
    expect(normalizeWebsite('example.com')).toBe('https://example.com');
  });

  it('keeps https', () => {
    expect(normalizeWebsite('https://example.com')).toBe('https://example.com');
  });

  it('keeps http', () => {
    expect(normalizeWebsite('http://example.com')).toBe('http://example.com');
  });

  it('handles subdomain', () => {
    expect(normalizeWebsite('www.example.com')).toBe('https://www.example.com');
  });

  it('handles empty string', () => {
    expect(normalizeWebsite('')).toBe('');
  });

  it('handles domain with path', () => {
    expect(normalizeWebsite('example.com/page')).toBe('https://example.com/page');
  });
});
