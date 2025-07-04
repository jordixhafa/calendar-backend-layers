import { AppDataSource } from '../src/config/db';
import { Event } from '../src/models/Event';
import { DataSource } from 'typeorm';

jest.setTimeout(500000);

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('Business Logic Layer - Event Classification', () => {
  it('classifies events by day', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find({ relations: ['owner'] });

    expect(events.length).toBeGreaterThan(0);

    const eventsByDay = events.reduce((acc, event) => {
      const day = new Date(event.start).toISOString().split('T')[0];
      if (!acc[day]) acc[day] = [];
      acc[day].push(event);
      return acc;
    }, {} as Record<string, Event[]>);

    expect(Object.keys(eventsByDay).length).toBeGreaterThan(0);

    
    console.log(`Classified events into ${Object.keys(eventsByDay).length} unique day(s).`);
  });
});
