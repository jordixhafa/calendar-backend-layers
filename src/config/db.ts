import 'reflect-metadata';
import { DataSource } from 'typeorm';

// Load configuration from ormconfig.json
export const AppDataSource = new DataSource(require('../../ormconfig.json'));

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log('  Database connected');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
};