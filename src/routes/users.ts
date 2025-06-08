// User routes
import { Router } from 'express';
import { UserController } from '../controllers/UserController';
import { authMiddleware } from '../middlewares/auth';
import { body } from 'express-validator';
import { validation } from '../utils/validation';

const router = Router();
router.use(authMiddleware);

router.put(
  '/me',
  [
    body('email').optional().isEmail(),
    body('password').optional().isLength({ min: 8 }),
    body('name').optional().notEmpty(),
    validation
  ],
  UserController.update
);

router.delete('/me', UserController.delete);
router.post('/password-reset', [ body('email').isEmail(), validation ], UserController.requestReset);
router.post('/password-reset/confirm', [ body('token').notEmpty(), body('password').isLength({ min: 8 }), validation ], UserController.resetPassword);

export default router;
