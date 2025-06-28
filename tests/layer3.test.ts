import { AppDataSource } from '../src/config/db';
import { Event } from '../src/models/Event';
import { DataSource } from 'typeorm';
import fs from 'fs/promises';

jest.setTimeout(500000);

let dataSource: DataSource;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
  await fs.mkdir('./exports', { recursive: true });
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('I/O Layer - Export to file', () => {
  it('exports events to JSON file and recurrence groups', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find();

    expect(events.length).toBeGreaterThan(0);

    await fs.writeFile('./exports/events.json', JSON.stringify(events, null, 2));

    const daily = events.filter(e => e.recurrence === 'daily');
    const weekly = events.filter(e => e.recurrence === 'weekly');
    const monthly = events.filter(e => e.recurrence === 'monthly');

    await fs.writeFile('./exports/event-day.json', JSON.stringify(daily, null, 2));
    await fs.writeFile('./exports/event-week.json', JSON.stringify(weekly, null, 2));
    await fs.writeFile('./exports/event-month.json', JSON.stringify(monthly, null, 2));
  });
});
