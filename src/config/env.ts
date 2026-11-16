import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({
  path: process.env.NODE_ENV === 'test' ? '.env.test' : '.env',
});

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(4000),
  CORS_ORIGIN: z.string().min(1),

  DB_HOST: z.string().min(1).default('127.0.0.1'),
  DB_PORT: z.coerce.number().int().positive().default(3306),
  DB_USER: z.string().min(1).default('ojtflow_app'),
  DB_PASSWORD: z.string().default(''),
  DB_NAME: z.string().min(1).default('ojtflow'),

  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  JWT_EXPIRES_IN: z.string().min(1).default('2h'),
  JWT_REMEMBER_EXPIRES_IN: z.string().min(1).default('7d'),

  APPLY_REQUIRES_ELIGIBLE: z
    .string()
    .default('true')
    .transform((val) => val.toLowerCase() === 'true'),

  AI_PROVIDER: z.enum(['mock', 'openai', 'gemini']).default('mock'),
  AI_API_KEY: z.string().optional().default(''),
  AI_MODEL: z.string().optional().default(''),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;