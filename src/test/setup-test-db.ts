import { join } from 'path';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../db/schema';

export type TestDbContext = {
  pool: Pool;
  db: NodePgDatabase<typeof schema>;
  testDbName: string;
};

const adminDbUrl = `postgres://test_user:password@localhost:5432/postgres`;

export async function createTestDb(): Promise<TestDbContext> {
  const testDbName = `test_db_${randomUUID().replace(/-/g, '')}`;
  const testDbUrl = `postgres://test_user:password@localhost:5432/${testDbName}`;

  // 1. Create DB
  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(`CREATE DATABASE "${testDbName}"`);
  await adminPool.end();

  // 2. Connect and migrate
  const pool = new Pool({ connectionString: testDbUrl });
  const db = drizzle(pool, { schema, casing: 'snake_case' });
  await migrate(db, { migrationsFolder: join(__dirname, '../db/drizzle') });

  return { pool, db, testDbName };
}

export async function destroyTestDb({ pool, testDbName }: TestDbContext) {
  await pool.end();

  const adminPool = new Pool({ connectionString: adminDbUrl });
  await adminPool.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
  `,
    [testDbName]
  );
  await adminPool.query(`DROP DATABASE IF EXISTS "${testDbName}"`);
  await adminPool.end();
}
