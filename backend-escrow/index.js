// Vercel entry point - exports the Express app
import app from './src/app.js';

// For Vercel serverless functions, export the app
export default app;

// For local development, you can uncomment the following lines:
// import { createServer } from 'http';
// const server = createServer(app);
// server.listen(3000, () => console.log('Server running on port 3000'));