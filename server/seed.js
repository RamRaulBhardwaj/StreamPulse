import { seedData } from './src/utils/seeder.js';

seedData()
  .then(() => process.exit(0))
  .catch(() => process.exit(1));
