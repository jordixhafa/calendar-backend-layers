import { AppDataSource } from '../src/config/db';
import { Event } from '../src/models/Event';
import { DataSource, Between } from 'typeorm';
import notifier from 'node-notifier';

jest.setTimeout(500000);

let dataSource: DataSource;
const now = new Date();
const msInHour = 60 * 60 * 1000;
const msInDay = msInHour * 24;

beforeAll(async () => {
  dataSource = await AppDataSource.initialize();
});

afterAll(async () => {
  await dataSource.destroy();
  process.exit(0); // Force exit to prevent lingering handles
});

const notifyUsersOfEvents = async (events: Event[]) => {
  for (const event of events) {
    for (const email of event.invitees) {
      notifier.notify({
        title: `Reminder: ${event.title}`,
        message: `Hi ${email}, your event "${event.title}" is starting soon.`,
        timeout: 5,
      });
    }
  }
};

describe('Push Notification Benchmark', () => {
  it('sends notifications for single events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find({ where: { label: 'single' } });
    await notifyUsersOfEvents(events);
  });

  it('sends notifications for today’s events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find({
      where: {
        start: Between(now, new Date(now.getTime() + msInDay)),
      },
    });
    await notifyUsersOfEvents(events);
  });

  it('sends notifications for this week’s events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find({
      where: {
        start: Between(now, new Date(now.getTime() + msInDay * 7)),
      },
    });
    await notifyUsersOfEvents(events);
  });

  it('sends notifications for this month’s events', async () => {
    const eventRepo = dataSource.getRepository(Event);
    const events = await eventRepo.find({
      where: {
        start: Between(now, new Date(now.getTime() + msInDay * 30)),
      },
    });
    await notifyUsersOfEvents(events);
  });
});
