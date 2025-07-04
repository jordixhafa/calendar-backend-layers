import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/config/db';
import { User } from '../src/models/User';
import { Event, Recurrence } from '../src/models/Event';

jest.setTimeout(500000);

let dataSource: DataSource;
const NUM_USERS = 20000;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
  await dataSource.createQueryBuilder().delete().from(Event).execute();
  await dataSource.createQueryBuilder().delete().from(User).execute();
});

afterAll(async () => {
  await dataSource.destroy();
});

describe(`Layer 1 - Creates ${NUM_USERS} users and events`, () => {
  it(`should create ${NUM_USERS} users and events`, async () => {
    const userRepo = dataSource.getRepository(User);
    const eventRepo = dataSource.getRepository(Event);

    const now = Date.now();

    const recurrenceTypes: Recurrence[] = ['daily', 'weekly', 'monthly'];

    for (let i = 0; i < NUM_USERS; i++) {
      const user = userRepo.create({
        name: `User ${i}`,
        email: `user${i}@layer1.test`,
        password: `pass${i}`,
      });
      const savedUser = await userRepo.save(user);

      const recurrence = recurrenceTypes[i % recurrenceTypes.length];

      const event = eventRepo.create({
        title: `Event ${i}`,
        description: `Auto-generated event for ${savedUser.name}`,
        start: new Date(now + (i % 24) * 3600000),
        end: new Date(now + ((i % 24) * 3600000) + 1800000),
        label: recurrence, 
        reminderMinutesBefore: i % 15,
        recurrence,
        invitees: [savedUser.email],
        owner: savedUser,
      });

      const savedEvent = await eventRepo.save(event);

      expect(savedUser.id).toBeDefined();
      expect(savedEvent.id).toBeDefined();
    }

    const userCount = await userRepo.count();
    const eventCount = await eventRepo.count();

    expect(userCount).toBeGreaterThanOrEqual(NUM_USERS);
    expect(eventCount).toBeGreaterThanOrEqual(NUM_USERS);
  });
});
