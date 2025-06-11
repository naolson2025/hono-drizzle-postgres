import { sql } from 'drizzle-orm';
import { pgTable, text, integer, boolean } from 'drizzle-orm/pg-core';

export const usersTable = pgTable('users', {
  id: text().primaryKey(),
  email: text().unique().notNull(),
  passwordHash: text().notNull(),
  age: integer(),
});

export const todosTable = pgTable('todos', {
  id: text().primaryKey(),
  userId: text()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
  title: text().notNull(),
  description: text(),
  completed: boolean().default(false),
  createdAt: text().default(sql`(CURRENT_TIMESTAMP)`),
  updatedAt: text().default(sql`(CURRENT_TIMESTAMP)`),
});
