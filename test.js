// Imports
import initializeServer from './app/initializeServer.js';
import { app } from './app/app.js';

// Start the server
(async () => {
    await initializeServer().then (async () => {
        await app();
        return
    })
})()