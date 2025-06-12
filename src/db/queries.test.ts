import {
  afterAll,
  afterEach,
  beforeAll,
  describe,
  expect,
  it,
  mock,
} from 'bun:test';
import {
  getTodosByUserId,
  getUserByEmail,
  insertTodo,
  insertUser,
} from './queries';
import { NewTodo } from '../todos/types';
import { randomUUID } from 'crypto';
import { Pool } from 'pg';
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import * as schema from '../db/schema';
import { join } from 'path';
import { DbError } from '../todos/types';

// Unique test DB name per run
const TEST_DB_NAME = `test_db_${randomUUID().replace(/-/g, '')}`;
const TEST_DB_URL = `postgres://test_user:password@localhost:5432/${TEST_DB_NAME}`;
const ADMIN_DB_URL = `postgres://test_user:password@localhost:5432/todos`;

let pool: Pool;
let db: ReturnType<typeof drizzle>;

beforeAll(async () => {
  // 1. Create the test database using superuser connection
  const adminPool = new Pool({ connectionString: ADMIN_DB_URL });
  await adminPool.query(`CREATE DATABASE "${TEST_DB_NAME}"`);
  await adminPool.end();

  // 2. Connect to the test database and run migrations
  pool = new Pool({ connectionString: TEST_DB_URL });
  db = drizzle(pool, { schema, casing: 'snake_case' });

  // 3. Run migrations (adjust path as needed)
  await migrate(db, { migrationsFolder: join(__dirname, '/drizzle') });

  // 4. Mock the db module to use our test db
  await mock.module('../db/db.ts', () => ({
    db,
  }));
});

afterEach(async () => {
  // truncate tables after each test
  await db.execute(`TRUNCATE TABLE users, todos RESTART IDENTITY CASCADE;`);
});

afterAll(async () => {
  // 1. Close pool connections to the test DB
  await pool.end();

  // 2. Drop the test database using admin connection
  const adminPool = new Pool({ connectionString: ADMIN_DB_URL });
  // Terminate any remaining connections to allow drop
  await adminPool.query(
    `
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE datname = $1 AND pid <> pg_backend_pid()
  `,
    [TEST_DB_NAME]
  );
  await adminPool.query(`DROP DATABASE IF EXISTS "${TEST_DB_NAME}"`);
  await adminPool.end();
});

describe('insertUser', () => {
  it('should insert a user into the database', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(email, password);
    expect(userId).toBeDefined();
  });

  it('should throw an error if the email is already in the db', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    await insertUser(email, password);

    try {
      await insertUser(email, password);
    } catch (error) {
      const dbError = error as DbError;
      expect(dbError.cause.stack).toMatch(/violates unique constraint/);
    }
  });

  it('should throw an error if the password is empty', async () => {
    const email = 'test@test.com';
    const password = '';
    try {
      await insertUser(email, password);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-expect-error we know its type error
      expect(error.message).toMatch(/password must not be empty/);
    }
  });
});

describe('getUserByEmail', () => {
  it('return a user by a given email', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    await insertUser(email, password);

    const user = getUserByEmail(email);
    expect(user).toBeDefined();
  });

  it('returns undefined when there is no user by that email', async () => {
    const email = 'test@test.com';
    const user = await getUserByEmail(email);
    expect(user).toBeUndefined();
  });
});

describe('insertTodo', () => {
  it('should insert a todo into the database', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(email, password);

    const newTodo = {
      userId: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = await insertTodo(newTodo);

    expect(todo).toBeDefined();
    expect(todo.id).toBeDefined();
    expect(todo.userId).toBe(newTodo.userId);
    expect(todo.title).toBe(newTodo.title);
    expect(todo.description).toBe(newTodo.description!);
    expect(todo.completed).toBeFalsy();
    expect(todo.createdAt).toBeDefined();
    expect(todo.updatedAt).toBeDefined();
  });

  it('should throw an error if user_id does not exist', async () => {
    const newTodo = {
      userId: randomUUID(), // Non-existent user ID
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;

    try {
      await insertTodo(newTodo);
    } catch (error) {
      const dbError = error as DbError;
      expect(dbError.cause.stack).toMatch(/violates foreign key constraint/);
    }
  });

  it('should throw an error if title is empty', async () => {
    const email = 'test@test.com';
    const password = 'password123';
    const userId = await insertUser(email, password);
    const newTodo = {
      userId: userId,
      title: '', // Empty title
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    try {
      await insertTodo(newTodo);
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      // @ts-expect-error we know its type error
      expect(error.message).toMatch(/CHECK constraint failed/);
    }
  });
});

describe('getTodosByUserId', () => {
  it('should return todos for a given user ID', async () => {
    const userId = await insertUser('test@test.com', 'password123');

    const newTodo1 = {
      userId: userId,
      title: 'Test Todo 1',
      description: 'This is the first test todo',
      completed: false,
    } as NewTodo;

    const newTodo2 = {
      userId: userId,
      title: 'Test Todo 2',
      description: 'This is the second test todo',
      completed: true,
    } as NewTodo;

    await insertTodo(newTodo1);
    await insertTodo(newTodo2);
    const todos = await getTodosByUserId(userId);
    expect(todos).toBeDefined();
    expect(todos.length).toBe(2);
    expect(todos[0].userId).toBe(userId);
    expect(todos[1].userId).toBe(userId);
    expect(todos[0].title).toBe(newTodo2.title);
    expect(todos[1].title).toBe(newTodo1.title);
    expect(todos[0].description).toBe(newTodo2.description!);
    expect(todos[1].description).toBe(newTodo1.description!);
    expect(todos[0].completed).toBeTruthy();
    expect(todos[1].completed).toBeFalsy();
  });

  it('should return an empty array if no todos exist for the user', async () => {
    const userId = await insertUser('test@test.com', 'password123');
    const todos = await getTodosByUserId(userId);
    expect(todos).toBeDefined();
    expect(todos.length).toBe(0);
  });

  it('should return an empty array if user_id does not exist', async () => {
    const todos = await getTodosByUserId(randomUUID()); // Non-existent user ID
    expect(todos).toBeDefined();
    expect(todos.length).toBe(0);
  });
});
