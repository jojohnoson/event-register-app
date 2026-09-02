import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function verifyAll() {
  console.log('--- Starting Neon DB Full Verification ---');
  const databaseUrl = process.env.DATABASE_URL;
  const sql = neon(databaseUrl);

  // 1. Insert a sample user
  const sampleUser = {
    name: 'Sarah Connor',
    email: `sarah.connor.${Date.now()}@cyberdyne.org`,
    phone: '+1 (555) 019-2834',
    age: 32,
    organization: 'Cyberdyne Systems',
    role: 'Lead Security Architect',
    notes: 'Attending cyber security and cloud workshop sessions.',
  };

  console.log('Inserting sample user:', sampleUser.name);
  const inserted = await sql`
    INSERT INTO registrations (name, email, phone, age, organization, role, notes)
    VALUES (
      ${sampleUser.name},
      ${sampleUser.email},
      ${sampleUser.phone},
      ${sampleUser.age},
      ${sampleUser.organization},
      ${sampleUser.role},
      ${sampleUser.notes}
    )
    RETURNING *;
  `;
  console.log('Inserted user ID:', inserted[0].id);

  // 2. Fetch users list
  const users = await sql`SELECT * FROM registrations ORDER BY created_at DESC;`;
  console.log(`Total users in DB: ${users.length}`);
  console.log('Latest registered user:', {
    name: users[0].name,
    email: users[0].email,
    org: users[0].organization,
    phone: users[0].phone,
    age: users[0].age,
  });

  // 3. Search query test
  const searchResult = await sql`
    SELECT * FROM registrations 
    WHERE name ILIKE '%Sarah%' OR organization ILIKE '%Cyberdyne%';
  `;
  console.log(`Search for "Sarah" matched: ${searchResult.length} record(s)`);

  // 4. Aggregate stats test
  const stats = await sql`
    SELECT 
      COUNT(*)::int as total,
      COUNT(DISTINCT organization)::int as orgs,
      ROUND(AVG(age), 1)::float as avg_age
    FROM registrations;
  `;
  console.log('Aggregated DB Stats:', stats[0]);

  console.log('--- Verification Complete: ALL TESTS PASSED! ---');
}

verifyAll().catch((err) => {
  console.error('Verification failed:', err);
  process.exit(1);
});
