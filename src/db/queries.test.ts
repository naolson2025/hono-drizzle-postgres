import { describe, expect, it } from 'bun:test';
import {
  getTodosByUserId,
  getUserByEmail,
  insertTodo,
  insertUser,
  deleteTodo,
  updateTodo,
} from './queries';
import { NewTodo } from '../todos/types';
import { randomUUID } from 'crypto';
import { DbError } from '../todos/types';
import type { UUID } from 'crypto';

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

describe('deleteTodo', () => {
  it('should delete a todo by ID', async () => {
    const userId = await insertUser('test@test.com', 'password123');
    const newTodo = {
      userId: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = await insertTodo(newTodo);
    const deletedTodo = await deleteTodo(todo.id as UUID);
    expect(deletedTodo).toBeDefined();
    expect(deletedTodo.id).toBe(todo.id);
  });

  it('should return undefined if the todo does not exist', async () => {
    const deletedTodo = await deleteTodo(randomUUID()); // Non-existent todo ID
    expect(deletedTodo).toBeUndefined();
  });

  it('should throw an error if the todo ID is invalid', async () => {
    try {
      await deleteTodo('invalid-uuid' as UUID); // Invalid UUID
    } catch (error) {
      expect(error).toBeInstanceOf(Error);
      const dbError = error as DbError;
      expect(dbError.cause.stack).toMatch(/invalid input syntax for type uuid/);
    }
  });
});

describe('updateTodo', () => {
  it('should update a todo by ID', async () => {
    const userId = await insertUser('test@test.com', 'password123');
    const newTodo = {
      userId: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = await insertTodo(newTodo);
    const update = {
      title: 'Updated Test Todo',
      description: 'This is an updated test todo',
      completed: true,
    };
    const updatedTodo = await updateTodo(todo.id as UUID, userId, update);
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toBe(todo.id);
    expect(updatedTodo.title).toBe(update.title);
    expect(updatedTodo.description).toBe(update.description);
    expect(updatedTodo.completed).toBeTruthy();
  });

  it('should return undefined if the todo does not exist', async () => {
    const update = {
      title: 'Updated Test Todo',
      description: 'This is an updated test todo',
      completed: true,
    };
    const updatedTodo = await updateTodo(
      randomUUID() as UUID,
      randomUUID() as UUID,
      update
    ); // Non-existent todo ID
    expect(updatedTodo).toBeUndefined();
  });

  it('should update a todo with partial fields', async () => {
    const userId = await insertUser('test@test.com', 'password123');
    const newTodo = {
      userId: userId,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = await insertTodo(newTodo);
    const update = {
      title: 'Partially Updated Test Todo',
    };
    const updatedTodo = await updateTodo(todo.id as UUID, userId, update);
    expect(updatedTodo).toBeDefined();
    expect(updatedTodo.id).toBe(todo.id);
    expect(updatedTodo.title).toBe(update.title);
    expect(updatedTodo.description).toBe(todo.description);
    expect(updatedTodo.completed).toBeFalsy();
  });

  it('should return undefined if the userId does not match', async () => {
    const userId1 = await insertUser('test@test.com', 'password123');
    const userId2 = await insertUser('fake@fake.com', 'password123');
    const newTodo = {
      userId: userId1,
      title: 'Test Todo',
      description: 'This is a test todo',
      completed: false,
    } as NewTodo;
    const todo = await insertTodo(newTodo);
    const update = {
      title: 'Updated Test Todo',
      description: 'This is an updated test todo',
      completed: true,
    };
    const updatedTodo = await updateTodo(todo.id as UUID, userId2, update);
    expect(updatedTodo).toBeUndefined();
  });
});
