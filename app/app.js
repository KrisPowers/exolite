// Imports
import express from 'express';
import { db } from './db.js';
import open from 'open';
import path from 'path';
import { fileURLToPath } from 'url';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
import { UAParser } from "ua-parser-js";

export async function app() {
    try { 
        const config = await db.get('config')

        const app = express()
        app.set('trust proxy', true)

        app.use(async (req, res, next) => {

            if(!(req.path).includes('.js') && !(req.path).includes('.css') && !(req.path).includes('.ico') && !(req.path).includes('api')){

                console.log(req.headers['x-forwarded-for'] || req.socket.remoteAddress );

                await db.add('lastLog', 1)
                const newLog = await db.get('lastLog')
                const start = Date.now(); // Capture start time

                // ---- User Agent Parsing ----
                const parser = new UAParser(req.headers["user-agent"]);
                const ua = parser.getResult();

                // Event listener for when the response finishes
                res.on('finish', async () => {
                    const duration = Date.now() - start; // Calculate duration
                    const logEntry = {
                        id: newLog,
                        method: req.method,
                        path: req.path,
                        status: res.statusCode,
                        flagged: false,
                        flagMessage: null,
                        ip: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
                        device: ua.device.type || "Desktop",
                        os: `${ua.os.name || "Unknown"} ${ua.os.version || ""}`.trim(),
                        browser: `${ua.browser.name || "Unknown"} ${ua.browser.version || ""}`.trim(),
                        time: new Date().toLocaleString(),
                        timing: {
                            proccessing: `${duration}ms`,
                        },
                    };
                    await db.push('logs', logEntry);
                    return;
                });

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
            // await logEvent(req, req.headers['user-agent'], req.headers['host'], req.path);

            const path = req.params.path;

            if (path == 'docs') {
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard - Logs</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="#" class="nav-item" data-page="configuration"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="#" class="nav-item" data-page="configuration"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="#" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="#" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="#" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="#" class="nav-item active" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main class="content"> <section class="request-logs-layout"> <!-- LEFT: LOG LIST --> <aside class="log-list" id="logList"> <!-- Logs injected by JS --> </aside> <div class="log-detail" id="logDetail"> <p class="empty-state">Select a request to view details</p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <script src="./js/request-logs.js"></script> <script src="./js/static.js"></script> </body> </html>`)
            } else if (path == 'logs'){
                res.send(`<!DOCTYPE html> <html lang="en"> <head> <meta charset="UTF-8" /> <title>Dashboard - Logs</title> <!-- Icons (Lucide via CDN) --> <script src="https://unpkg.com/lucide@latest"></script> <link rel="stylesheet" href="./css/static.css" /> </head> <body> <aside class="sidebar" id="sidebar"> <div class="sidebar-header"> <span class="logo">Dashboard</span> <button id="toggleSidebar" aria-label="Toggle sidebar"> <i data-lucide="chevron-left"></i> </button> </div> <nav class="nav"> <a href="#" class="nav-item" data-page="configuration"> <i data-lucide="book"></i> <span>Documentation</span> </a> <a href="#" class="nav-item" data-page="configuration"> <i data-lucide="settings"></i> <span>Configuration</span> </a> <a href="#" class="nav-item" data-page="analytics"> <i data-lucide="bar-chart-3"></i> <span>Analytics</span> </a> <a href="#" class="nav-item" data-page="pages"> <i data-lucide="layout"></i> <span>Pages</span> </a> <a href="#" class="nav-item" data-page="workers"> <i data-lucide="users"></i> <span>Workers</span> </a> <a href="#" class="nav-item active" data-page="logs"> <i data-lucide="file-text"></i> <span>Request Logs</span> </a> </nav> </aside> <main class="content"> <section class="request-logs-layout"> <!-- LEFT: LOG LIST --> <aside class="log-list" id="logList"> <!-- Logs injected by JS --> </aside> <div class="log-detail" id="logDetail"> <p class="empty-state">Select a request to view details</p> </div> </section> </main> <!-- Chart.js --> <script src="https://cdn.jsdelivr.net/npm/chart.js"></script> <script src="./js/request-logs.js"></script> <script src="./js/static.js"></script> </body> </html>`)
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

        app.listen(config.port, () => {
            console.log(`[ExoLite] Thank you for using our services!\nYour dashboard page will automatically open in your browser.\nTo access your dashboard manually, please visit localhost:${config.port}/dashboard`);
            open(`http://localhost:${config.port}/dashboard`);
        })

    } catch (error) {
        console.error("[ExoLite] Error initializing the dashboard:", error);
    }
}