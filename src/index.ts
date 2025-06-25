import { Hono } from 'hono';
import { csrf } from 'hono/csrf';
// import { jwt } from 'hono/jwt';
// import { auth } from './auth/auth.routes';
import { todos } from './todos/todos.routes';
import { logger } from 'hono/logger';
import { auth } from './lib/auth';

const secret = process.env.JWT_SECRET;
if (!secret) {
  console.error('JWT_SECRET is not configured.');
  process.exit(1);
}

if (!process.env.DATABASE_URL) {
  console.error('DATABASE_URL is not configured.');
  process.exit(1);
}

const app = new Hono();

if (process.env.NODE_ENV !== 'test') {
  app.use(logger());
}

app
  .use('/api/protected/**', (c) => auth.handler(c.req.raw))
  .use('/api/*', csrf())
  // .use('*', async (c, next) => {
  //   if (c.req.path.includes('protected')) {
  //     return jwt({ secret, cookie: 'authToken' })(c, next);
  //   }
  //   await next();
  // })
  // .route('/api', auth)
  .route('/api/protected', todos)
  .get('/health', (c) => {
    return c.json({ status: 'healthy!! 🍀' });
  });

export default app;
