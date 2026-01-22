// Imports
import express from 'express';
import { db } from './db.js';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import cors from 'cors';
import { middleware } from './middleware.js'

export async function app() {
    try { 
        const config = await db.get('config')
        const app = express()

        // Middleware
        app.use(async (req, res, next) => {
            await middleware(req, res)
            next();
        });

        // UI Elemenets Rendering
        app.get('/:route/:fileType/:fileName', async function (req, res) {
            const route = req.params.route
            const fileType = req.params.fileType
            const fileName = req.params.fileName
            if(route == 'client' || route == 'dashboard'){
                res.sendFile(path.join(__dirname, `/client/${fileType}/${fileName}`));
            } else if(route == 'api'){
                if(fileType == 'logs'){
                    if(fileName == 'all'){
                        const logs = ((await db.get('logs')) || []).slice().reverse();
                        return res.json(logs);
                    } else {
                        const id = fileName;
                        const logs = (await db.get('logs')) || [];
                        const log = logs.find(l => l.id === Number(id));
                        if (!log) return res.status(404).json({ error: "Log not found" });
                        return res.json(log);
                    }
                } else if(fileType == 'analytics'){
                    if(fileName == 'all'){
                        const analytics = await db.get('analytics');
                        res.json(analytics);
                    }
                } else {
                    console.error('UI Asset rendering error.')
                }
            } else {
                console.error('UI Asset rendering error.')
            }
        })

        // Dashboard Rendering
        app.get('/dashboard/:path', async (req, res) => {

            if(req.headers.host != `localhost:${config.port}`){
                return res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <script src="./js/static.js"></script> </body> </html>`)
            } else {
                const path = req.params.path;
                const paths = await db.get('dashboard')

                if (paths && paths[path]) {
                    res.send(await db.get(`dashboard.${path}.content`));
                    return;
                } else {
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <script src="./js/static.js"></script> </body> </html>`)
                    return;
                }
            }

        })

        // Pages
        app.get('/:path', async (req, res) => {

            const path = req.params.path;
            const paths = await db.get('pages');

            if (paths && paths[path]) {
                await db.add('analytics.requests.visits', 1) // Path Visit
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths[path].headerTitle}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths[path].content} </main> </body> </html>`);
                return;
            } else {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <meta name="viewport" content="width=device-width, initial-scale=1.0" /> <title>${paths['404'].headerTitle}</title> <link rel="stylesheet" href="./client/css/static.css" /> </head> <body> <main> ${paths['404'].content} </main> </body> </html>`);
                return;
            }

        })

        // Workers
        app.get("/worker/:path", (req, res) => {
            const path = req.params.path;
            res.type("application/javascript").send(storedJs);

            /*
            Option 1 — Script tag
            <script src="/dynamic/script.js"></script>

            Option 2 — Dynamic import
            import("/dynamic/script.js").then(() => {
                console.log("Dynamic JS loaded");
            });
            */

        });

        app.set('trust proxy', true)
        app.use(cors())
        app.listen(config.port, () => {
            console.log(`\n\n\x1b[0mYour dashboard page will \x1b[32mautomatically\x1b[0m open in your browser.\n\x1b[30m\x1b[43mTo access your dashboard manually, please visit localhost:${config.port}/dashboard/overview\x1b[0m\n\n`);
            open(`http://localhost:${config.port}/dashboard/overview`);
        })

    } catch (error) {
        console.error("[APIRO] Error initializing the dashboard:", error);
    }
}