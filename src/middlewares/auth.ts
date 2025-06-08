// Auth middleware
import { Request, Response, NextFunction } from 'express';
import * as jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt';

export const authMiddleware = (req: Request & { user?: any }, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ message: 'No token' });
  const [, token] = auth.split(' ');
  try {
    const payload = jwt.verify(token, jwtConfig.secret) as any;
    req.user = { id: payload.sub };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
};
