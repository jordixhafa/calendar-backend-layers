// Auth routes
import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';
import { body } from 'express-validator';
import { validation } from '../utils/validation';

const router = Router();

router.post(
  '/register',
  [
    body('name').notEmpty(),
    body('email').isEmail(),
    body('password').isLength({ min: 8 }),
    validation
  ],
  AuthController.register
);

router.post('/login', AuthController.login);

export default router;
