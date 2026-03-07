import { defineConfig } from 'prisma/config';
import 'dotenv/config';

export default defineConfig({
  datasource: {
    // Use DIRECT_URL (non-pooled) for migrations if available, otherwise fall back to DATABASE_URL
    url: process.env.DIRECT_URL || process.env.DATABASE_URL!,
  },
});
