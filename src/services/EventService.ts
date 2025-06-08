// Event service
import { EventRepository } from '../repositories/EventRepository';
import { UserRepository } from '../repositories/UserRepository';
import { Event, Recurrence } from '../models/Event';

export class EventService {
  static async create(ownerId: string, data: Partial<Event>) {
    const user = await UserRepository().findOne({ where: { id: ownerId } });
    if (!user) throw new Error('Owner not found');
    const repo = EventRepository();
    const event = repo.create({ ...data, owner: user });
    return await repo.save(event);
  }

  static async list(ownerId: string) {
    return await EventRepository().find({where: { owner: { id: ownerId }, }, relations: ['owner'], });
  }

  static async get(ownerId: string, id: string) {
    
    const e = await EventRepository().findOne({where: { id },relations: ['owner'],});
    if (!e || e.owner.id !== ownerId) throw new Error('Not found or forbidden');
    return e;
  }

  static async update(ownerId: string, id: string, data: Partial<Event>) {
    const event = await this.get(ownerId, id);
    Object.assign(event, data);
    return await EventRepository().save(event);
  }

  static async remove(ownerId: string, id: string) {
    const event = await this.get(ownerId, id);
    await EventRepository().remove(event);
    return;
  }
}
