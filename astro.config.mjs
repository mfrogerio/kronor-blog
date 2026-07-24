import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';

export default defineConfig({
  output: 'server',
  adapter: vercel(),
  vite: {
    define: {
      'import.meta.env.AIRTABLE_BASE_ID': JSON.stringify(process.env.AIRTABLE_BASE_ID),
      'import.meta.env.AIRTABLE_API_KEY': JSON.stringify(process.env.AIRTABLE_API_KEY),
    },
  },
});