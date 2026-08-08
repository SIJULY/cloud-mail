import { serve } from '@hono/node-server';
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';

import app from './src/hono/webs.js';

// Polyfill for Cloudflare Workers KV
const kvDir = path.join(process.cwd(), 'kv_store');

class LocalKV {
    async init() {
        try {
            await fs.mkdir(kvDir, { recursive: true });
        } catch(e) {}
    }

    async put(key, content, options = {}) {
        await this.init();
        const safeKey = Buffer.from(key).toString('base64');
        const dataPath = path.join(kvDir, `${safeKey}.data`);
        const metaPath = path.join(kvDir, `${safeKey}.meta`);
        
        await fs.writeFile(dataPath, Buffer.from(content));
        if (options.metadata) {
            await fs.writeFile(metaPath, JSON.stringify(options.metadata));
        }
    }

    async delete(key) {
        await this.init();
        const safeKey = Buffer.from(key).toString('base64');
        try { await fs.unlink(path.join(kvDir, `${safeKey}.data`)); } catch(e) {}
        try { await fs.unlink(path.join(kvDir, `${safeKey}.meta`)); } catch(e) {}
    }

    async getWithMetadata(key, options = {}) {
        await this.init();
        const safeKey = Buffer.from(key).toString('base64');
        try {
            const data = await fs.readFile(path.join(kvDir, `${safeKey}.data`));
            let metadata = null;
            try {
                const metaStr = await fs.readFile(path.join(kvDir, `${safeKey}.meta`), 'utf-8');
                metadata = JSON.parse(metaStr);
            } catch(e) {}

            return {
                value: data,
                metadata: metadata
            };
        } catch(e) {
            return { value: null, metadata: null };
        }
    }
}

const localKV = new LocalKV();

// Inject env variables and KV into context
app.use('*', async (c, next) => {
    c.env = {
        kv: localKV,
        jwt_secret: process.env.JWT_SECRET || 'default_secret',
        domain: process.env.DOMAIN ? process.env.DOMAIN.split(',') : ['example.com'],
        admin: process.env.ADMIN || 'admin@example.com',
        orm_log: process.env.ORM_LOG === 'true',
        // Add database object if any other parts check for c.env.db
        db: true 
    };
    await next();
});

const port = process.env.PORT || 3000;
console.log(`Server is running on port ${port}`);

serve({
    fetch: app.fetch,
    port
});