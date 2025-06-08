// User controller
import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/UserService';
import { validationResult } from 'express-validator';

export class UserController {
  static async update(req: Request, res: Response, next: NextFunction) {
    const errs = validationResult(req);
    if (!errs.isEmpty()) return res.status(400).json({ errors: errs.array() });
    try {
      const user = await UserService.updateProfile(req.user.id, req.body);
      res.json(user);
    } catch (err) { next(err); }
  }

  static async delete(req: Request, res: Response, next: NextFunction) {
    await UserService.deleteAccount(req.user.id);
    res.status(204).send();
  }

  static async requestReset(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.requestPasswordReset(req.body.email);
      res.json({ message: 'Email sent' });
    } catch (err) { next(err); }
  }

  static async resetPassword(req: Request, res: Response, next: NextFunction) {
    try {
      await UserService.resetPassword(req.body.token, req.body.password);
      res.json({ message: 'Password updated' });
    } catch (err) { next(err); }
  }
}
