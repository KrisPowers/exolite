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

        app.get('/dashboard/:path', async (req, res) => {

            if(req.headers.host != `localhost:${config.port}`){
                return res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <script src="./js/static.js"></script> </body> </html>`)
            } else {
                const path = req.params.path;

                if (path == 'overview'){
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> </div> <nav class="nav"> <a href="#" class="nav-item active" data-page="overview"> <i data-lucide="panels-top-left"></i> <span>Overview</span> </a> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> </nav> </aside> <main class="content"> <section class="analytics-split"> <header class="analytics-header"> <h1>Overview</h1> </header> <div class="analytics-layout"> <!-- LEFT PANEL --> <aside class="analytics-left"> <!-- KPI --> <div class="kpi-group"> <div class="kpi"> <div class="kpi-label">Requests</div> <div class="kpi-value" id="kpiRequests">0</div> </div> <div class="kpi"> <div class="kpi-label">Page Visits</div> <div class="kpi-value" id="kpiVisits">0</div> </div> <div class="kpi kpi-hidden"> <div class="kpi-label"> Hidden Requests <span class="info-icon" tabindex="0"> <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-info-icon lucide-info"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg> </span> </div> <div class="kpi-value" id="kpiHidden">0</div> <div class="info-popover"> Hidden requests include health checks, internal polling, bot mitigation, and system-level traffic not tied to page views. </div> </div> </div> <!-- Tables --> <div class="data-section"> <h3>Top Paths</h3> <table class="analytics-table"> <tbody id="pathsTable"></tbody> </table> </div> <div class="data-section"> <h3>Operating Systems</h3> <table class="analytics-table"> <tbody id="osTable"></tbody> </table> </div> <div class="data-section"> <h3>Browsers</h3> <table class="analytics-table"> <tbody id="browserTable"></tbody> </table> </div> </aside> <section class="request-logs-layout"> <!-- LEFT: LOG LIST --> <aside class="log-list" id="logList"> <!-- Logs injected by JS --> </aside> <div class="log-detail" id="logDetail"> <p class="empty-state">Select a request to view details</p> </div> </section> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <script src="./js/static.js"></script> </body> </html>`)
                } else if (path == 'docs') {
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span>  </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/overview" class="nav-item" data-page="overview"> <i data-lucide="file-text"></i> <span>Overview</span> </a> <a href="#" class="nav-item active" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'config'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span>  </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/overview" class="nav-item" data-page="overview"> <i data-lucide="file-text"></i> <span>Overview</span> </a> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="#" class="nav-item active" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'pages'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span>  </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/overview" class="nav-item" data-page="overview"> <i data-lucide="file-text"></i> <span>Overview</span> </a> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="#" class="nav-item active" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'workers'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span>  </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/overview" class="nav-item" data-page="overview"> <i data-lucide="file-text"></i> <span>Overview</span> </a> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="#" class="nav-item active" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else {
                    // 404 No page
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>  <script src="./js/static.js"></script> </body> </html>`)
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