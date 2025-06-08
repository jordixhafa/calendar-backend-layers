// Event routes
import { Router } from 'express';
import { EventController } from '../controllers/EventController';
import { authMiddleware } from '../middlewares/auth';
import { body, param } from 'express-validator';
import { validation } from '../utils/validation';

const router = Router();
router.use(authMiddleware);

const eventValidation = [
  body('title').notEmpty(),
  body('description').notEmpty(),
  body('start').isISO8601(),
  body('end').isISO8601(),
  body('label').notEmpty(),
  validation
];

router.post('/', eventValidation, EventController.create);
router.get('/', EventController.list);
router.get('/:id', [param('id').isUUID(), validation], EventController.get);
router.put('/:id', [param('id').isUUID(), ...eventValidation], EventController.update);
router.delete('/:id', [param('id').isUUID(), validation], EventController.remove);

export default router;
