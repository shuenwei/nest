import dotenv from 'dotenv';
dotenv.config();

import app from './utils/app'; // Express app instance
import mongo from './utils/mongo'; // Mongoose connect logic
import { PORT } from './constants';
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import './utils/telegram-bot';

// Immediately connect to DB and attach routes before Cloud Run starts handling
const setup = async () => {
  await mongo.connect();

  app.get('/', (_, res) => {
    res.status(200).send('Hello, world!');
  });

  app.get('/healthz', (_, res) => {
    res.sendStatus(204);
  });

  app.use('/auth', authRoutes);
  app.use('/user', userRoutes);

  // Local dev server (optional)
  if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => {
      console.log(`✅ Server listening on http://localhost:${PORT}`);
    });
  }
};

setup();

export default app;
