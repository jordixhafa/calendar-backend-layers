// User repository
import { AppDataSource } from '../config/db';
import { User } from '../models/User';

export const UserRepository = () => AppDataSource.getRepository(User);
