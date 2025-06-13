import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../src/db/schema';
import { join } from 'path';
// import { seedDb } from './seed.script';

if (!process.env.DATABASE_URL || !process.env.ADMIN_DB_URL) {
  throw new Error('DATABASE_URL and ADMIN_DB_URL must be set in .env');
}

// Admin connection (to drop/create DB)
const ADMIN_URL = process.env.ADMIN_DB_URL;
// Target DB connection (for migrations/seeding)
const TARGET_URL = process.env.DATABASE_URL;
const DB_NAME = TARGET_URL.split('/').pop(); // Extract the database name from the URL

async function dropAndCreateDatabase() {
  const adminPool = new Pool({ connectionString: ADMIN_URL });
  // Terminate connections to target DB
  await adminPool.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
  `,
    [DB_NAME]
  );
  // Drop and recreate
  await adminPool.query(`DROP DATABASE IF EXISTS "${DB_NAME}"`);
  await adminPool.query(`CREATE DATABASE "${DB_NAME}"`);
  await adminPool.end();
}

async function runMigrations() {
  const pool = new Pool({ connectionString: TARGET_URL });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  await migrate(db, { migrationsFolder: join(__dirname, '../src/db/drizzle') });
  await pool.end();
}

async function runSeed() {
  // You can run your seed script as a child process:
  const { execSync } = await import('child_process');
  execSync('npm run db:seed', { stdio: 'inherit' });
}

async function main() {
  console.log('🔄 Dropping and recreating database...');
  await dropAndCreateDatabase();

  console.log('🛠️ Running migrations...');
  await runMigrations();

  console.log('🌱 Seeding database...');
  await runSeed();
  // await seedDb();

  console.log('✅ Database reset complete!');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
