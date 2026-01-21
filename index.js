// Imports
import initializeServer from './app/initializeServer.js';
import { app } from './app/app.js';

// Start the server
export async function build() {

    (async () => {
        await initializeServer().then (async () => {
            await app();
            return
        })
    })()

}