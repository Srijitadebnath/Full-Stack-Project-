import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Connect using the 24/7 Cloud DATABASE_URL with resilient pooling for Neon Serverless
export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false, // Required for secure cloud SSL connections
    },
    max: 10,                          // Optimal connection count for Neon free tier
    idleTimeoutMillis: 10000,         // Clean up idle connections before cloud proxy drops them
    connectionTimeoutMillis: 20000,   // 20s allows Neon compute to wake from sleep without timeout
    keepAlive: true,                  // Keeps socket connection alive across firewalls/NATs
});

pool.on('connect', () => {
    console.log('☁️ Successfully connected to 24/7 Cloud PostgreSQL (Neon)!');
});

pool.on('error', (err) => {
    console.warn('⚠️ Warning: Database connection blip encountered, keeping server alive:', err.message);
});
