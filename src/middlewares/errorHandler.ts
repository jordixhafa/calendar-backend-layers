// Error handler middleware
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error(err);
  res.status(400).json({ message: err.message || 'Internal error' });
};
