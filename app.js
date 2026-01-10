// Imports
import express from 'express';
import { db } from './db.js';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function app() {
    try { 
        const config = await db.get('config')

        const app = express()

        app.get('/client/:type/:fileName', async function (req, res) {

            const type = req.params.type
            const fileName = req.params.fileName
            res.sendFile(path.join(__dirname, `/client/${type}/${fileName}`));

        })

        app.get('/dashboard', (req, res) => {
            // Build request params to review request info including IP address, user agent, etc.
            res.send('Welcome to your dashboard!')
        })

        app.get('/:path', async (req, res) => {
            const path = req.params.path;

            const paths = await db.get('config.pages');

            if (paths && paths[path]) {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths[path].title}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths[path].content} </main> </body> </html>`);
                return;
            } else {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths['404'].title}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths['404'].content} </main> </body> </html>`);
                return;
            }

        })

        app.listen(config.port, () => {
            console.log(`[EXOLITE] Access your dashboard at localhost:${config.port}/dashboard`);
            open(`http://localhost:${config.port}/dashboard`);
        })

    } catch (error) {
        console.error("[EXOLITE] Error initializing the dashboard:", error);
    }
}