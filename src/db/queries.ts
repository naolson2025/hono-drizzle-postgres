import { randomUUID } from 'crypto';
import { NewTodo } from '../todos/types';
import { todosTable, usersTable } from './schema';
import { eq, desc } from 'drizzle-orm';
import { db } from './db';

export const insertUser = async (email: string, password: string) => {
  const userId = randomUUID();

  const passwordHash = await Bun.password.hash(password);

  const [user] = await db
    .insert(usersTable)
    .values({
      id: userId,
      email,
      passwordHash,
    })
    .returning();

  return user.id;
};

export const getUserByEmail = async (email: string) => {
  const [user] = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.email, email));

  return user;
};

export const getUserById = async (id: string) => {
  const [user] = await db
    .select({ id: usersTable.id, email: usersTable.email })
    .from(usersTable)
    .where(eq(usersTable.id, id));

  return user;
};

export const insertTodo = async (todo: NewTodo) => {
  const todoId = randomUUID();

  const [result] = await db
    .insert(todosTable)
    .values({
      id: todoId,
      ...todo,
    })
    .returning();

  return result;
};

export const getTodosByUserId = async (userId: string) => {
  const todos = await db
    .select()
    .from(todosTable)
    .where(eq(todosTable.userId, userId))
    .orderBy(desc(todosTable.createdAt));

  return todos;
};
