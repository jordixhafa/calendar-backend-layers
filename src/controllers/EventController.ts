// Event controller
import { Request, Response, NextFunction } from 'express';
import { EventService } from '../services/EventService';
import { validationResult } from 'express-validator';

export class EventController {
  static async create(req: Request, res: Response, next: NextFunction) {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    try {
      const event = await EventService.create(req.user.id, req.body);
      res.status(201).json(event);
    } catch (err) { next(err); }
  }

  static async list(req: Request, res: Response, next: NextFunction) {
    res.json(await EventService.list(req.user.id));
  }

  static async get(req: Request, res: Response, next: NextFunction) {
    res.json(await EventService.get(req.user.id, req.params.id));
  }

  static async update(req: Request, res: Response, next: NextFunction) {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    res.json(await EventService.update(req.user.id, req.params.id, req.body));
  }

  static async remove(req: Request, res: Response, next: NextFunction) {
    await EventService.remove(req.user.id, req.params.id);
    res.status(204).send();
  }
}
