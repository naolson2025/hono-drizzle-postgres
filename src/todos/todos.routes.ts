import { Hono } from 'hono';
import { insertTodo, getTodosByUserId, updateTodo } from '../db/queries';
import { createTodoValidator } from './create.todo.schema';
import {
  updateTodoValidatorBody,
  updateTodoValidatorParams,
} from './udpate.todo.schema';
import type { UUID } from 'crypto';

export const todos = new Hono();

todos
  .post('/todos', createTodoValidator, async (c) => {
    const { sub } = c.get('jwtPayload');
    const { title, description, completed } = c.req.valid('json');

    try {
      const todo = await insertTodo({
        userId: sub,
        title,
        description,
        completed,
      });

      return c.json(todo, 201);
    } catch (error) {
      console.error('Error creating todo:', error);
      return c.json({ errors: ['Internal server error'] }, 500);
    }
  })
  .get('/todos', async (c) => {
    const { sub } = c.get('jwtPayload');

    try {
      const todos = await getTodosByUserId(sub);
      return c.json(todos, 200);
    } catch (error) {
      console.error('Error fetching todos:', error);
      return c.json({ errors: ['Internal server error'] }, 500);
    }
  })
  .patch(
    '/todos/:id',
    updateTodoValidatorBody,
    updateTodoValidatorParams,
    async (c) => {
      const { sub } = c.get('jwtPayload');
      const todoId = c.req.valid('param').id as UUID;
      const update = c.req.valid('json');

      try {
        const updatedTodo = await updateTodo(todoId, sub, {
          ...update,
        });

        if (!updatedTodo) {
          return c.json({ errors: ['Todo not found'] }, 404);
        }

        return c.json(updatedTodo, 200);
      } catch (error) {
        console.error('Error updating todo:', error);
        return c.json({ errors: ['Internal server error'] }, 500);
      }
    }
  );
