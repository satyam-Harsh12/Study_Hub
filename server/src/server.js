import app from './app.js';
import { connectDB } from './config/db.js';
import { PORT } from './config/env.js';

import { startAttendanceCron } from './cron/attendanceCron.js';

const start = async () => {
  await connectDB();
  startAttendanceCron();
  app.listen(PORT, () => {
    // eslint-disable-next-line no-console
    console.log(`Server running on port ${PORT}`);
  });
};

start();


