import 'dotenv/config';
import { env } from '@env';
import { defineConfig } from 'drizzle-kit';

export default defineConfig({
  out: './src/infra/db/migrations',
  schema: './src/infra/db/schemas',
  dialect: 'postgresql',
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});
