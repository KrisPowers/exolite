// Imports
import initializeServer from './initializeServer.js';
import { app } from './app.js';

// Start the server

export async function listen() {

    (async () => {
        await initializeServer().then (async () => {
        await app();
        return
        })
    })()

}