import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const rows = await sql`
    SELECT id, event_id, attendee_id, name, email, created_at 
    FROM event_registrations 
    ORDER BY id DESC 
    LIMIT 25;
  `;
  console.log('Latest registrations in DB:');
  console.log(JSON.stringify(rows, null, 2));

  const allEvents = await sql`SELECT id, title, slug FROM events ORDER BY id ASC`;
  console.log('Events in DB:');
  console.log(JSON.stringify(allEvents, null, 2));
}

main().catch(console.error);
