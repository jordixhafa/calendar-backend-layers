// Server bootstrap
import 'reflect-metadata';
import { connectDB } from './config/db';
import { app } from './app';

const PORT = process.env.PORT || 3000;

(async () => {
  await connectDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
})();
