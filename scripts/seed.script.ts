import * as schema from '../src/db/schema';
import { seed } from 'drizzle-seed';
import { db, pool } from '../src/db/db';

export const seedDb = async () => {
  await seed(db, schema).refine((funcs) => ({
    usersTable: {
      columns: {
        age: funcs.int({ minValue: 0, maxValue: 120 }),
        // This is "password123" hashed with argon2
        passwordHash: funcs.default({
          defaultValue:
            '$argon2id$v=19$m=65536,t=2,p=1$fiKHnn0LRcOmaHJ21amaIHdCMOJPIgQgWu6l5az9dTo$6PG1lcOkeV+yjD2mW8eBfmvZX6z1fDt1wmyiGrwZSng',
        }),
      },
      count: 10,
      with: {
        todosTable: 10,
      },
    },
    todosTable: {
      columns: {
        title: funcs.valuesFromArray({
          values: [
            'Buy groceries',
            'Walk the dog',
            'Read a book',
            'Write code',
            'Go for a run',
            'Cook dinner',
            'Clean the house',
            'Watch a movie',
            'Call a friend',
            'Plan a trip',
          ],
        }),
        description: funcs.valuesFromArray({
          values: [
            'Very carefully.',
            'Make sure to take breaks.',
            'It is a great way to relax.',
            'Focus on the task at hand.',
            'Stay hydrated',
            'Remember to stretch.',
            'Keep your workspace tidy.',
            'Enjoy the process.',
          ],
        }),
      },
    },
  }));
};

seedDb()
  .then(() => {
    console.log('Database seeded successfully');
    return pool.end();
  })
  .catch((err) => {
    console.error('Error seeding database:', err);
    return pool.end();
  });
