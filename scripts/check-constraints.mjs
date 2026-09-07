import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function main() {
  const indexes = await sql`
    SELECT indexname, indexdef 
    FROM pg_indexes 
    WHERE tablename = 'event_registrations';
  `;
  console.log('Indexes on event_registrations:', JSON.stringify(indexes, null, 2));

  const constraints = await sql`
    SELECT conname, contype, pg_get_constraintdef(oid)
    FROM pg_constraint
    WHERE conrelid = 'event_registrations'::regclass;
  `;
  console.log('Constraints on event_registrations:', JSON.stringify(constraints, null, 2));
}

main().catch(console.error);
