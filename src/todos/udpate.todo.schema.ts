import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const updateTodoSchemaBody = z
  .object({
    title: z
      .string()
      .min(1, 'Title needs to be at least 1 character long')
      .optional(),
    description: z.string().optional(),
    completed: z.boolean().optional(),
  })
  .strict({
    message:
      'You provided invalid data, only title, description, and completed are allowed',
  });

export const updateTodoValidatorBody = zValidator(
  'json',
  updateTodoSchemaBody,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.issues.map((issue) => issue.message),
        },
        400
      );
    }
  }
);

export const updateTodoSchemaParams = z.object({
  id: z.string().uuid('Invalid todo ID format'),
});

export const updateTodoValidatorParams = zValidator(
  'param',
  updateTodoSchemaParams,
  (result, c) => {
    if (!result.success) {
      return c.json(
        {
          errors: result.error.issues.map((issue) => issue.message),
        },
        400
      );
    }
  }
);
