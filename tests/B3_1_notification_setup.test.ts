import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/config/db';
import { User } from '../src/models/User';
import { Event } from '../src/models/Event';

jest.setTimeout(500000); 

let dataSource: DataSource;
const NOTIFY_USER_COUNT = 100;

const now = new Date();
const msInHour = 60 * 60 * 1000;
const msInDay = msInHour * 24;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();

  // Delete previous users and events
  await dataSource.createQueryBuilder().delete().from(Event).execute();
  await dataSource.createQueryBuilder().delete().from(User).execute();

  const userRepo = dataSource.getRepository(User);
  const eventRepo = dataSource.getRepository(Event);

  const eventOffsets = {
    single: 0,
    day: msInDay,
    week: msInDay * 7,
    month: msInDay * 30,
  };

  // Create users and events
  for (let i = 0; i < NOTIFY_USER_COUNT; i++) {
    const user = userRepo.create({
      name: `User ${i}`,
      email: `user${i}@calendar.com`,
      password: `pass${i}`,
    });
    const savedUser = await userRepo.save(user);

    for (const [label, offset] of Object.entries(eventOffsets)) {
      const event = eventRepo.create({
        title: `${label} event for ${user.name}`,
        description: `Notify test - ${label}`,
        start: new Date(now.getTime() + offset),
        end: new Date(now.getTime() + offset + msInHour),
        label,
        reminderMinutesBefore: 10,
        recurrence: 'none',
        owner: savedUser,
        invitees: [savedUser.email],
      });
      await eventRepo.save(event);
    }
  }
});

afterAll(async () => {
  await dataSource.destroy();
});

describe('Setup complete', () => {
  it('creates users and events for notification benchmark', async () => {
    const userCount = await dataSource.getRepository(User).count();
    expect(userCount).toBeGreaterThan(0);
  });
});
