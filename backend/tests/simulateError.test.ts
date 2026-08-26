import { describe, it, expect } from 'vitest';
import { shouldSimulateError } from '../src/services/simulateError.js';

describe('shouldSimulateError', () => {
  it('returns true for username starting with C', () => {
    expect(shouldSimulateError('Clementine')).toBe(true);
  });

  it('returns true for uppercase C', () => {
    expect(shouldSimulateError('CHARLES')).toBe(true);
  });

  it('returns false for other usernames', () => {
    expect(shouldSimulateError('Bret')).toBe(false);
  });

  it('returns false for lowercase c', () => {
    expect(shouldSimulateError('clementine')).toBe(true);
  });

  it('returns false for empty string', () => {
    expect(shouldSimulateError('')).toBe(false);
  });

  it('returns true for C alone', () => {
    expect(shouldSimulateError('C')).toBe(true);
  });
});
