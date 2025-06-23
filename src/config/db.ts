/*import 'reflect-metadata';
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
};*/

import 'reflect-metadata';
import { DataSource, DataSourceOptions } from 'typeorm';
import ormConfigRaw from '../../ormconfig.json';
import { User } from '../models/User';
import { Event } from '../models/Event';

// Assert the correct type
const ormConfig = ormConfigRaw as DataSourceOptions;

export const AppDataSource = new DataSource({
  ...ormConfig,
  entities: [User, Event], 
  
});

export const connectDB = async () => {
  try {
    await AppDataSource.initialize();
    console.log(' Database connected');
  } catch (error) {
    console.error(' Database connection failed:', error);
    process.exit(1);
  }
};
