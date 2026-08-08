import { drizzle } from 'drizzle-orm/better-sqlite3';
import Database from 'better-sqlite3';
import path from 'path';

// Singleton database instance
let dbInstance = null;

export default function orm(c) {
    if (!dbInstance) {
        // When running in Node.js, we create a local sqlite database file
        const dbPath = process.env.DATABASE_URL || path.join(process.cwd(), 'database.sqlite');
        const sqlite = new Database(dbPath);
        dbInstance = drizzle(sqlite, { logger: process.env.ORM_LOG === 'true' || c?.env?.orm_log });
    }
    return dbInstance;
}