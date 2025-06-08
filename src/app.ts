// App entry
import express from 'express';
import routes from './routes';
import { errorHandler } from './middlewares/errorHandler';

export const app = express();
app.use(express.json());
app.use('/api', routes);
app.use(errorHandler);
