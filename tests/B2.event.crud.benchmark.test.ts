import { DataSource } from 'typeorm';
import { AppDataSource } from '../src/config/db';
import { User } from '../src/models/User';
import { Event, Recurrence } from '../src/models/Event';

jest.setTimeout(500000); // 500 seconds

let dataSource: DataSource;
const EVENT_COUNT = Number(process.env.EVENT_COUNT || 18000);

let testUser: User;

const createTestEvent = (i: number): Partial<Event> => ({
  title: `Event ${i}`,
  description: `This is test event number ${i}`,
  start: new Date(Date.now() + i * 3600000), // i hours from now
  end: new Date(Date.now() + i * 3600000 + 1800000), // 30 min duration
  label: `label-${i % 5}`,
  reminderMinutesBefore: i % 60,
  recurrence: ['none', 'daily', 'weekly'][i % 3] as Recurrence,
  invitees: [`user${i}@example.com`, `guest${i}@example.com`],
});

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();

  // Use a unique email per run to avoid constraint collisions
  const timestamp = Date.now();
  const userRepo = dataSource.getRepository(User);
  testUser = userRepo.create({
    name: 'Event Tester',
    email: `event_${timestamp}@test.com`,
    password: 'securepassword',
  });
  testUser = await userRepo.save(testUser);
});

afterAll(async () => {
  // Delete the test user; cascade should remove their events
  await dataSource.getRepository(User).delete({ id: testUser.id });
  await dataSource.destroy();
});

describe(`CRUD operations for ${EVENT_COUNT} events`, () => {
  const createdEvents: Event[] = [];

  it(`should create ${EVENT_COUNT} events`, async () => {
    const eventRepo = dataSource.getRepository(Event);
    for (let i = 0; i < EVENT_COUNT; i++) {
      const eventData = createTestEvent(i);
      const event = eventRepo.create({ ...eventData, owner: testUser });
      const savedEvent = await eventRepo.save(event);
      createdEvents.push(savedEvent);
      expect(savedEvent.id).toBeDefined();
    }
  }, 60_000);

  it('should read all created events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    for (const event of createdEvents) {
      const found = await eventRepo.findOneOrFail({
        where: { id: event.id },
        relations: ['owner'],
      });
      expect(found.title).toBe(event.title);
      expect(found.owner.id).toBe(testUser.id);
    }
  });

  it('should update all events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    for (const event of createdEvents) {
      event.title += ' - Updated';
      const updated = await eventRepo.save(event);
      expect(updated.title).toMatch(/Updated$/);
    }
  });

  // No need to manually delete events; cascaded by user deletion in afterAll
});
