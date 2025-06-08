// Route index
import { Router } from 'express';
import auth from './auth';
import users from './users';
import events from './events';

const router = Router();
router.use('/auth', auth);
router.use('/users', users);
router.use('/events', events);

export default router;
