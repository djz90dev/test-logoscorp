import { describe, it, expect } from 'vitest';
import { syncUserSchema, syncBulkSchema } from '../src/modules/contacts/contacts.schema.js';

describe('Validation Schemas', () => {
  describe('syncUserSchema', () => {
    it('validates correct user', () => {
      const result = syncUserSchema.safeParse({
        user: {
          id: 1,
          name: 'Test User',
          username: 'testuser',
          email: 'test@example.com',
          phone: '123-456-7890',
          website: 'example.com',
          company: { name: 'Test Inc.', catchPhrase: 'test', bs: 'test' },
        },
      });
      expect(result.success).toBe(true);
    });

    it('rejects invalid email', () => {
      const result = syncUserSchema.safeParse({
        user: {
          id: 1,
          name: 'Test',
          username: 'test',
          email: 'invalid',
          phone: '123',
          website: 'example.com',
          company: { name: 'Test', catchPhrase: 'test', bs: 'test' },
        },
      });
      expect(result.success).toBe(false);
    });

    it('rejects missing user', () => {
      const result = syncUserSchema.safeParse({});
      expect(result.success).toBe(false);
    });
  });

  describe('syncBulkSchema', () => {
    it('validates array of users', () => {
      const result = syncBulkSchema.safeParse({
        users: [
          {
            id: 1,
            name: 'Test',
            username: 'test',
            email: 'test@example.com',
            phone: '123',
            website: 'example.com',
            company: { name: 'Test', catchPhrase: 'test', bs: 'test' },
          },
        ],
      });
      expect(result.success).toBe(true);
    });

    it('rejects empty array', () => {
      const result = syncBulkSchema.safeParse({ users: [] });
      expect(result.success).toBe(false);
    });

    it('rejects non-array', () => {
      const result = syncBulkSchema.safeParse({ users: 'not-array' });
      expect(result.success).toBe(false);
    });
  });
});
