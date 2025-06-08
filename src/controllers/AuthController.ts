// Auth controller
import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/AuthService';
import { validationResult } from 'express-validator';

export class AuthController {
  static async register(req: Request, res: Response, next: NextFunction) {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    try {
      const user = await AuthService.register(req.body.name, req.body.email, req.body.password);
      res.status(201).json(user);
    } catch (err) { next(err); }
  }

  static async login(req: Request, res: Response, next: NextFunction) {
    try {
      const { user, token } = await AuthService.login(req.body.email, req.body.password);
      res.json({ user, token });
    } catch (err) { next(err); }
  }
}
