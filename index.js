// Imports
import initializeServer from './initializeServer.js';
import { app } from './app.js';

// Start the server

(async () => {
    await initializeServer().then (async () => {
       await app();
       return
    })
})()