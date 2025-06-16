import { NewTodo } from '../todos/types';
import { todosTable, usersTable } from './schema';
import { eq, desc } from 'drizzle-orm';
import { db } from './db';
import type { UUID } from 'crypto';

export const insertUser = async (email: string, password: string) => {
  const passwordHash = await Bun.password.hash(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      email,
      passwordHash,
    })
    .returning();

  return user.id as UUID;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

export const getUserById = async (id: UUID) => {
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return user;
};

export const insertTodo = async (todo: NewTodo) => {
  const [result] = await db.insert(todosTable).values(todo).returning();

  return result;
};

export const getTodosByUserId = async (userId: UUID) => {
  const todos = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, userId))
    .orderBy(desc(todosTable.createdAt));

  return todos;
};

export const deleteTodo = async (todoId: UUID) => {
  const [result] = await db
    .delete(todosTable)
    .where(eq(todosTable.id, todoId))
    .returning();

  return result;
};
