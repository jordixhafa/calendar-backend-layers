// Event repository
import { AppDataSource } from '../config/db';
import { Event } from '../models/Event';

export const EventRepository = () => AppDataSource.getRepository(Event);
