import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';

export const signinSchema = z.object({
  email: z.string().email(),
  password: z
    .string()
    .min(10, { message: 'Password must be at least 10 characters long.' }),
});

export const signinValidator = zValidator('json', signinSchema, (result, c) => {
  if (!result.success) {
    return c.json(
      {
        // errors: result.error.issues.map((issue) => issue.message),
        errors: result,
      },
      400
    );
  }
});
