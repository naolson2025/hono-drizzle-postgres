/*
  Example usage:

  hono> const res = await app.request('/health')
  undefined
  hono> await res.json()
  { status: 'healthy!! 🍀' }

  hono> await queries.getUserByEmail('test@test.com')
*/

import * as repl from 'node:repl';
import { serve } from '@hono/node-server';
import app from '../src/index'; // Import your Hono app instance
import * as queries from '../src/db/queries'; // Import all your consolidated services
import * as db from '../src/db/db'; // Import your database connection/client

console.log('🚀 Starting Hono server for console...');

// Start the Hono server in the background.
// The server runs on port 3000 by default.
// Start the Hono server in the background using the Node adapter
const server = serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`✅ Server listening on http://localhost:${info.port}`);
  }
);

console.log('🔥 Starting interactive console... (Press Ctrl+C twice to exit)');
console.log('Available globals: app, queries, db');

// Start the REPL server
const replServer = repl.start({
  prompt: 'hono> ',
  useColors: true,
});

// Attach your application modules to the REPL's context
// This makes them available as global variables in the console.
replServer.context.app = app;
replServer.context.queries = queries;
replServer.context.db = db;

// Handle graceful shutdown
replServer.on('exit', () => {
  console.log('👋 Exiting console and shutting down server...');
  server.close(() => {
    console.log('✅ Server shut down.');
    process.exit(0);
  });
});
