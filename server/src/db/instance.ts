import { drizzle } from 'drizzle-orm/libsql';
import { createClient } from '@libsql/client';
import * as schema from '../config/schema'; 
import path from 'path';
import { fileURLToPath } from 'url';
import pc from 'picocolors';

// Handling __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * 1. Resolve path to SQLite file
 */
const dbPath = path.resolve(__dirname, '../../canteen.db');

/**
 * 2. Initialize the LibSQL client
 * This replaces better-sqlite3. It works natively on Linux without 
 * needing to compile C++ bindings during install.
 */
const client = createClient({ 
    url: `file:${dbPath}`,
});

/**
 * 3. Initialize Drizzle
 * We use the 'libsql' export from drizzle-orm.
 */
export const db = drizzle(client, { schema });

// Success logging for your Kali terminal
console.log(`${pc.magenta('💾 DB Instance:')} LibSQL Ready at ${pc.dim(dbPath)}`);

export default db;