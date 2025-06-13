import * as schema from './schema';
import { seed } from 'drizzle-seed';
import { db } from './db';

const seedDb = async () => {
  await seed(db, schema).refine(() => ({
    usersTable: {
      columns: {},
      count: 10,
      with: {
        todosTable: 10,
      },
    },
  }));
};

seedDb()
  .then(() => console.log('Database seeded successfully'))
  .catch((err) => console.error(`Error seeding database: ${err}`));
