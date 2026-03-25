import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

export default defineConfig({
  // 1. Point to your TypeScript schema
  schema: './src/config/schema.ts',
  
  // 2. Folder where migrations will be stored
  out: './drizzle',
  
  // 3. Dialect for SQLite
  dialect: 'sqlite',
  
  dbCredentials: {
    // 🛡️ Root Cause Fix: Change this to match your dbPath in instance.ts
    url: 'canteen.db', 
  },
  
  // Development helpers
  verbose: true,
  strict: true,
});