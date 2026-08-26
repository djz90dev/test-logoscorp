import { z } from 'zod';

const userSchema = z.object({
  id: z.number(),
  name: z.string(),
  username: z.string(),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  company: z.object({
    name: z.string(),
    catchPhrase: z.string(),
    bs: z.string(),
  }),
});

export const syncUserSchema = z.object({
  user: userSchema,
});

export const syncBulkSchema = z.object({
  users: z.array(userSchema).min(1, 'At least one user is required'),
});
