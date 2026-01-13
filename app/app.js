// Imports
import express from 'express';
import { db } from './db.js';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { UAParser } from "ua-parser-js";
import { isBot, isAICrawler, isAIAssistant } from 'ua-parser-js/bot-detection';

export async function app() {
    try { 
        const config = await db.get('config')

        const app = express()

        app.use(async (req, res, next) => {

            if(!(req.path).includes('.js') && !(req.path).includes('.css') && !(req.path).includes('.ico') && !(req.path).includes('api')){

                await db.add('lastLog', 1)
                const newLog = await db.get('lastLog')
                const start = Date.now(); // Capture start time

                // ---- User Agent Parsing ----
                const parser = new UAParser(req.headers["user-agent"]);
                const reqData = parser.getResult();

                const ip =
                Array.isArray(req.ips) && req.ips.length > 0
                    ? req.ips[0]
                    : "Localhost";

                const region =
                    req.get("cf-ipcountry") ||
                    (req.ip === "::1" || req.ip === "127.0.0.1" ? "Localhost" : "UNKNOWN");

                if(isAICrawler(req.headers["user-agent"]) || isAIAssistant(req.headers["user-agent"]) || isBot(req.headers["user-agent"])){
                    // Event listener for when the response finishes
                    res.on('finish', async () => {
                        const duration = Date.now() - start; // Calculate duration
                        const logEntry = {
                            id: newLog,
                            method: req.method,
                            path: req.path,
                            status: res.statusCode,
                            flagged: true,
                            note: 'Flagged for being marked either a Bot, AI Crawler, or AI Assistant. Please reveiew the log\'s security notes for further details.',
                            ip: ip,
                            agent: reqData.ua,
                            deviceType: reqData.device.type || "Unknown",
                            deviceModel: reqData.device.model || "Unknown",
                            deviceVendor: reqData.device.vendor || "Unknown",
                            os: `${reqData.os.name || "Unknown"} ${reqData.os.version || ""}` .replace(/\s\d+(\.\d+)*/g, "") .trim(),
                            browserName: `${reqData.browser.name || "Unknown"}`,
                            browserVersion: `${reqData.browser.version || "Unknown"}`,
                            browserMajor: `${reqData.browser.major || "Unknown"}`,
                            browserType: `${reqData.browser.type || "Unknown"}`,
                            engineName: reqData.engine.name,
                            engineVersion: reqData.engine.version,
                            cpu: reqData.cpu.architecture,
                            region: region,
                            aiCrailer: isAICrawler(req.headers["user-agent"]),
                            aiAssistant: isAIAssistant(req.headers["user-agent"]),
                            bot: isBot(req.headers["user-agent"]),
                            time: new Date().toLocaleString(),
                            timing: {
                                proccessing: `${duration}ms`,
                            },
                        };
                        await db.push('logs', logEntry);
                        return;
                    });
                } else {
                    // Event listener for when the response finishes
                    res.on('finish', async () => {
                        const duration = Date.now() - start; // Calculate duration
                        const logEntry = {
                            id: newLog,
                            method: req.method,
                            path: req.path,
                            status: res.statusCode,
                            flagged: false,
                            note: null,
                            ip: ip,
                            agent: reqData.ua,
                            deviceType: reqData.device.type || "Unknown",
                            deviceModel: reqData.device.model || "Unknown",
                            deviceVendor: reqData.device.vendor || "Unknown",
                            os: `${reqData.os.name || "Unknown"} ${reqData.os.version || ""}` .replace(/\s\d+(\.\d+)*/g, "") .trim(),
                            browserName: `${reqData.browser.name || "Unknown"}`,
                            browserVersion: `${reqData.browser.version || "Unknown"}`,
                            browserMajor: `${reqData.browser.major || "Unknown"}`,
                            browserType: `${reqData.browser.type || "Unknown"}`,
                            engineName: reqData.engine.name,
                            engineVersion: reqData.engine.version,
                            cpu: reqData.cpu.architecture,
                            region: region,
                            aiCrailer: isAICrawler(req.headers["user-agent"]),
                            aiAssistant: isAIAssistant(req.headers["user-agent"]),
                            bot: isBot(req.headers["user-agent"]),
                            time: new Date().toLocaleString(),
                            timing: {
                                proccessing: `${duration}ms`,
                            },
                        };
                        await db.push('logs', logEntry);
                        return;
                    });
                }

            }
            next(); // Pass control to the next middleware/route handler
        });

        app.get('/client/:type/:fileName', async function (req, res) {

            const type = req.params.type
            const fileName = req.params.fileName
            res.sendFile(path.join(__dirname, `/client/${type}/${fileName}`));

        })

        app.get('/dashboard/:type/:fileName', async function (req, res) {

            const type = req.params.type
            const fileName = req.params.fileName
            res.sendFile(path.join(__dirname, `/client/${type}/${fileName}`));

        })

        app.get('/api/logs', async (req, res) => {

            const logs = ((await db.get('logs')) || []).slice().reverse();

            res.json(logs);

        })

        app.get("/api/logs/:id", async (req, res) => {

            const logs = (await db.get('logs')) || [];

            const log = logs.find(l => l.id === Number(req.params.id));
            if (!log) return res.status(404).json({ error: "Log not found" });
            res.json(log);

        });

        app.get('/dashboard/:path', async (req, res) => {

            if(req.headers.host != `localhost:${config.port}`){
                return res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <script src="./js/request-logs.js"></script> <script src="./js/static.js"></script> </body> </html>`)
            } else {
                const path = req.params.path;

                if (path == 'docs') {
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="#" class="nav-item active" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'config'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="#" class="nav-item active" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'analytics'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="#" class="nav-item active" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'pages'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="#" class="nav-item active" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if(path == 'workers'){ 
                    // Coming Soon
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="#" class="nav-item active" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <!-- MAIN CONTENT --> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">🚧</div> <h1>Coming Soon</h1> <p> This section is currently under development and will be available soon. </p> </div> </section> </main> <script src="./js/static.js"></script> </body> </html>`)
                } else if (path == 'logs'){
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="#" class="nav-item active" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main class="content"> <section class="request-logs-layout"> <!-- LEFT: LOG LIST --> <aside class="log-list" id="logList"> <!-- Logs injected by JS --> </aside> <div class="log-detail" id="logDetail"> <p class="empty-state">Select a request to view details</p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <script src="./js/request-logs.js"></script> <script src="./js/static.js"></script> </body> </html>`)
                } else {
                    // 404 No page
                    res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="http://localhost:${config.port}/dashboard/docs" class="nav-item" data-page="docs"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="http://localhost:${config.port}/dashboard/config" class="nav-item" data-page="config"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="http://localhost:${config.port}/dashboard/analytics" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="http://localhost:${config.port}/dashboard/pages" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="http://localhost:${config.port}/dashboard/workers" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="http://localhost:${config.port}/dashboard/logs" class="nav-item" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main> <section class="coming-soon"> <div class="coming-card"> <div class="icon">⛔</div> <h1>No page found</h1> <p> The page you're trying to access doesn't exist. </p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <script src="./js/request-logs.js"></script> <script src="./js/static.js"></script> </body> </html>`)
                }
            }

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

        app.set('trust proxy', true)
        app.listen(config.port, () => {
            console.log(`[ExoLite] Thank you for using our services!\nYour dashboard page will automatically open in your browser.\nTo access your dashboard manually, please visit localhost:${config.port}/dashboard`);
            open(`http://localhost:${config.port}/dashboard/docs`);
        })

    } catch (error) {
        console.error("[ExoLite] Error initializing the dashboard:", error);
    }
}