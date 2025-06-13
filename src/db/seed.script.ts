import * as schema from './schema';
import { seed } from 'drizzle-seed';
import { db, pool } from './db';

const seedDb = async () => {
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
