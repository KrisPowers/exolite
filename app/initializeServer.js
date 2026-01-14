// Imports
import express from 'express';
import { db } from './db.js';

export default async function initializeServer() {
    try {
        const config = await db.get('config')

        if(config.setupComplete) {
            return;
        } else {
            await db.set('config', {
                port: 6500,
                setupComplete: true,
                pages: {
                    404: {
                        title: 'Page Not Found',
                        content: `<div class="block404"> <div class="waves"></div> <div class="obj"> <img src="https://imgur.com/w0Yb4MX.png" alt=""> </div> <div class="t404"></div> <svg xmlns="http://www.w3.org/2000/svg" version="1.1"> <defs> <filter id="glitch"> <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="1" result="warp" id="turb"/> <feColorMatrix in="warp" result="huedturb" type="hueRotate" values="90"> <animate attributeType="XML" attributeName="values" values="0;180;360" dur="3s" repeatCount="indefinite"/> </feColorMatrix> <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="huedturb"/> </filter> </defs> </svg> </div>`   
                    },
                },
                workers: {},
            }).then (async () => {
                await db.set('analytics', {
                    requests: {
                        all: 0,
                        visits: 0,
                        hidden: 0,
                    },
                    os: {},
                    browser: {},
                    path: {}
                })
                return;
            })
        }

    } catch (error) {
        await db.set('config', {
            port: 6500,
            setupComplete: true,
            pages: {
                404: {
                    title: 'Page Not Found',
                    content: `<div class="block404"> <div class="waves"></div> <div class="obj"> <img src="https://imgur.com/w0Yb4MX.png" alt=""> </div> <div class="t404"></div> <svg xmlns="http://www.w3.org/2000/svg" version="1.1"> <defs> <filter id="glitch"> <feTurbulence type="fractalNoise" baseFrequency="0.01 0.03" numOctaves="1" result="warp" id="turb"/> <feColorMatrix in="warp" result="huedturb" type="hueRotate" values="90"> <animate attributeType="XML" attributeName="values" values="0;180;360" dur="3s" repeatCount="indefinite"/> </feColorMatrix> <feDisplacementMap xChannelSelector="R" yChannelSelector="G" scale="50" in="SourceGraphic" in2="huedturb"/> </filter> </defs> </svg> </div>`   
                },
            }
        }).then (async () => {
            await db.set('analytics', {
                requests: {
                    all: 0,
                    visits: 0,
                    hidden: 0,
                },
                os: {},
                browser: {},
                path: {}
            })
            return;
        })
    }
}