//This is your entry point. It bootstraps the environment, starts the listener, and handles cleanup logic.
import { config } from "dotenv";
config();
import { createServer } from 'http';
import app from './app.js';
import { sql } from './config/db.js';
import { info, error as _error } from './utils/logger.js';
import { startEscrowSyncWorker } from '../modules/escrow/sync.worker.js';

const PORT = process.env.PORT || 3000;

const server = createServer(app);
let stopEscrowSync = () => {};


const init = async function initialise() {
  try {
    //db connectoin
    await sql`SELECT 1`; 
    info('Database connection established successfully.'); 
    // Start the server
    server.listen(PORT, () => {
      info(`Server is running on port ${PORT}`);
    });
    stopEscrowSync = startEscrowSyncWorker();
  } catch (error) {
    _error('Failed to initialize the application:', error);
    process.exit(1); 
  } ;
};

// Graceful shutdown
const shutdown = () => {
  info('Shutting down gracefully...');
  stopEscrowSync();
  server.close(() => {
    info('Server closed');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

init();