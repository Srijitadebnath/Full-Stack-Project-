import { Pool } from 'pg';
import dotenv from 'dotenv';

// 1. Tell dotenv to read the .env file we just created
dotenv.config();

// 2. Create the Database Connection Pool
export const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'event_management_system',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    max: 20, // Keep up to 20 connections open for high traffic
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 2000,
});

// 3. Test the connection immediately when the server boots
pool.on('connect', () => {
    console.log('📦 Connected to PostgreSQL: event_management_system database');
});

pool.on('error', (err) => {
    console.error('❌ Unexpected database error on idle client:', err);
    process.exit(-1);
});