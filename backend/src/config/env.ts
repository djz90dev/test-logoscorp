import { z } from 'zod';
import dotenv from 'dotenv';

dotenv.config();

const envSchema = z.object({
  PORT: z.coerce.number().default(3000),
  CORS_ORIGIN: z.string().url().default('http://localhost:5173'),
  JSONPLACEHOLDER_BASE_URL: z
    .string()
    .url()
    .default('https://jsonplaceholder.typicode.com'),
  ZOHO_CLIENT_ID: z.string().min(1, 'ZOHO_CLIENT_ID is required'),
  ZOHO_CLIENT_SECRET: z.string().min(1, 'ZOHO_CLIENT_SECRET is required'),
  ZOHO_REFRESH_TOKEN: z.string().min(1, 'ZOHO_REFRESH_TOKEN is required'),
  ZOHO_ACCOUNT_SERVER: z
    .string()
    .url()
    .default('https://accounts.zoho.com'),
  ZOHO_API_BASE_URL: z
    .string()
    .url()
    .default('https://www.zohoapis.com/crm/v2'),
  ZOHO_ACCESS_TOKEN: z.string().optional(),
});

function loadConfig() {
  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const errors = result.error.flatten().fieldErrors;
    console.error('❌ Invalid environment configuration:');
    for (const [field, messages] of Object.entries(errors)) {
      console.error(`  ${field}: ${messages?.join(', ')}`);
    }
    process.exit(1);
  }

  return result.data;
}

export type EnvConfig = z.infer<typeof envSchema>;
export const config = loadConfig();
