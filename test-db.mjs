import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function testConnection() {
  console.log('Testing Neon DB connection...');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('ERROR: DATABASE_URL not set in .env.local');
    process.exit(1);
  }

  try {
    const sql = neon(databaseUrl);
    const result = await sql`SELECT NOW() as current_time;`;
    console.log('Successfully connected to Neon DB! Server time:', result[0].current_time);

    console.log('Ensuring table exists...');
    await sql`
      CREATE TABLE IF NOT EXISTS registrations (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(50) NOT NULL,
        age INTEGER NOT NULL,
        organization VARCHAR(255),
        role VARCHAR(255),
        notes TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `;
    console.log('Table `registrations` is ready!');

    const countResult = await sql`SELECT COUNT(*)::int as count FROM registrations;`;
    console.log('Current registration count:', countResult[0].count);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
}

testConnection();
