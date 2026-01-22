// Imports
import { db } from './db.js';
import { app } from './app.js';

/**
 * Pulls default config data from a URL, and imports it into the initialation process as needed.
 *
 * @private
 */

async function defualtConfig() {
  const res = await fetch('https://aprio.krispowers.dev/client/json/initialization.json')
  return await res.json()
}

/**
 * Set's up the backend functionality.
 *
 * This builds both the DB, with either default params or the user's custom config settings.
 *
 * @param {number} Port - The port on which the developer wants their project to run.
 * @param {boolean} Bot - Set True if the developer would like Bot Traffic redirected from their workers & pages. Automatically True if not configured.
 * @param {boolean} AI - Set True if the developer would like AI Traffic redirected from their workers & pages. Automatically True if not configured.
 * @param {boolean} Crawler - Set True if the developer would like AI Crawler Traffic redirected from their workers & pages. Automatically True if not configured.
 * @return {ServerResponse} Returns a console message once the DB is Initialized.
 * @private
 */

async function buildConfig(port, bot, ai, crawler) {
    const config = await defualtConfig();
        await db.set('config', {
            port: port, 
            build_version: '1.0.0', 
            setup_complete: true, 
            redirects: { bot: bot, ai: ai, crawler: crawler, }
        })
        await db.set('pages', { 
            404: { 
                title: '404', headerTitle: 'Page not found.', fileType: 'html', localLocked: false, content: `<div class="block404"> <div class="waves"></div> <div class="obj"> <img src="https://imgur.com/w0Yb4MX.png" alt=""> </div> <div class="t404"></div> <svg xmlns="http://www.w3.org/2000/svg" version="1.1"> <defs> <filter id="glitch"> <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="1" result="warp" id="turb"/> <feColorMatrix in="warp" result="huedturb" type="hueRotate" values="90"> <animate attributeType="XML" attributeName="values" values="0;180;360" dur="3s" repeatCount="indefinite"/> </feColorMatrix> <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="huedturb"/> </filter> </defs> </svg> </div>`   
            }, 
        })
    await db.set('analytics', config.analytics)
    await db.set('dashboard', config.dashboard)
    return console.log(`\x1b[30m\x1b[43mApiro backend initilized.\x1b[0m`);
}

/**
 * Set's up the backend functionality.
 *
 * This builds both the DB, with either default params or the user's custom config settings.
 *
 * @param {number} Port - The port on which the developer wants their project to run.
 * @param {boolean} Bot - Set True if the developer would like Bot Traffic redirected from their workers & pages. Automatically True if not configured.
 * @param {boolean} AI - Set True if the developer would like AI Traffic redirected from their workers & pages. Automatically True if not configured.
 * @param {boolean} Crawler - Set True if the developer would like AI Crawler Traffic redirected from their workers & pages. Automatically True if not configured.
 * @return {ServerResponse} Returns a console message once the DB is Initialized.
 * @public
 */

class build {

    constructor(options = {}) {
        
        // Runtime config
        this.port = options.port || "6850"; // Port Configuration

        // Security (Redirects)
        this.bot = options.bot || true; // Bot Traffic Management
        this.ai = options.ai || true; // AI Traffic Management
        this.crawler = options.crawler || true; // AI Crawler Management

        // Init Timeout
        this.isInitialized = false;
        this.initPromise = this.initialize();
        
        this.ready = this._init();
    }

    /**
     * Initializes the config, along with necessary pages & assets
     * 
     * @private
     */

    async _init() {
        try {
            if(await db.get('config.setup_complete')){
                return;
            } else {
                await buildConfig(this.port, this.bot, this.ai, this.crawler);
                return;
            }
        } catch {
            await buildConfig(this.port, this.bot, this.ai, this.crawler);
            return;
        }
    }

    /**
     * @return {boolean} Delays Public API use until configuration
     * @private
     */

    async initialize() {
        await new Promise(resolve => setTimeout(resolve, 1000));
        this.isInitialized = true;
    }
    
    /* -----------------------------
        PUBLIC API
    ------------------------------ */

    /**
     * @return {ServerInitialization} Starts the build that has been configured.
     * @public
     */

    async start() {
        const config = await defualtConfig();
        await this.initPromise;
        if(await db.get('config.setup_complete')){
            await db.set('dashboard', config.dashboard).then( async () => {
                await app();
                return;
            })
        }
    }

    /**
     * @return {String} Returns the build version in use. Typically, this is the same version as the NPM package version in use.
     * @public
     */

    async version() { 
        await this.initPromise;
        return await db.get('config.build_version');
    }

}

export { build };