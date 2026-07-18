import dotenv from 'dotenv';
import app from './src/app.js';
import { connectDB } from './src/config/db.js';

dotenv.config();

const PORT = process.env.PORT || 5000;

const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(`\n  NovaTech API`);
      console.log(`  Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Listening on: http://localhost:${PORT}`);
      console.log(`  Health check: http://localhost:${PORT}/api/health\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  }
};

start();

process.on('unhandledRejection', (err) => {
  console.error('Unhandled rejection:', err.message);
  process.exit(1);
});
