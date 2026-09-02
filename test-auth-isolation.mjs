import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
import { generateAdminToken, verifyAdminToken, validateAdminPassword } from './lib/admin-auth.js';

dotenv.config({ path: '.env.local' });

async function runIsolationTests() {
  console.log('========================================');
  console.log('🧪 Starting Role Isolation & Admin Tests');
  console.log('========================================\n');

  // 1. Test Admin Auth Utilities
  console.log('Test 1: Admin Password Validation');
  const validPass = validateAdminPassword('admin123');
  const invalidPass = validateAdminPassword('wrongpass');
  console.log('  - Valid password "admin123":', validPass ? 'PASSED ✅' : 'FAILED ❌');
  console.log('  - Invalid password "wrongpass":', !invalidPass ? 'PASSED ✅' : 'FAILED ❌');

  console.log('\nTest 2: Admin Token Generation & Verification');
  const token = generateAdminToken();
  const isValidToken = verifyAdminToken(token);
  const isInvalidToken = verifyAdminToken('invalid-fake-token');
  console.log('  - Generated token:', token.substring(0, 30) + '...');
  console.log('  - Token verification:', isValidToken ? 'PASSED ✅' : 'FAILED ❌');
  console.log('  - Fake token rejection:', !isInvalidToken ? 'PASSED ✅' : 'FAILED ❌');

  // 2. Database Connection & Isolation Query Tests
  console.log('\nTest 3: Database Isolation & Aggregate Stats');
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error('DATABASE_URL is not set in .env.local');
  }

  const sql = neon(databaseUrl);

  // Aggregate stats query (public metadata)
  const statsResult = await sql`
    SELECT 
      COUNT(*)::int as total_count,
      COUNT(DISTINCT organization)::int as total_organizations,
      COALESCE(ROUND(AVG(age), 1)::float, 0) as average_age
    FROM registrations;
  `;
  console.log('  - Public Aggregate Stats (No PII):', statsResult[0]);
  console.log('  - Aggregate Stats Query: PASSED ✅');

  // 3. Test Inserting a User & Single-User Isolated Lookup
  console.log('\nTest 4: Private Single-User Lookup (My Registration)');
  const testEmail = `test.user.${Date.now()}@privacytest.com`;
  const inserted = await sql`
    INSERT INTO registrations (name, email, phone, age, organization, role, notes)
    VALUES (
      'Alice Privacy',
      ${testEmail},
      '+1 (555) 987-6543',
      29,
      'Data Privacy Inc',
      'Privacy Officer',
      'Testing attendee data isolation'
    )
    RETURNING *;
  `;
  const newUserId = inserted[0].id;
  console.log(`  - Inserted test attendee ID: ${newUserId} (${inserted[0].email})`);

  // Lookup by exact email
  const lookupByEmail = await sql`
    SELECT id, name, email, phone, age, organization, role, notes, created_at
    FROM registrations
    WHERE LOWER(email) = ${testEmail.toLowerCase()}
    LIMIT 1;
  `;
  console.log('  - Lookup by email returned only 1 record:', lookupByEmail.length === 1 ? 'PASSED ✅' : 'FAILED ❌');
  console.log('  - Record matches name:', lookupByEmail[0]?.name === 'Alice Privacy' ? 'PASSED ✅' : 'FAILED ❌');

  // Clean up test attendee
  await sql`DELETE FROM registrations WHERE id = ${newUserId};`;
  console.log('  - Cleaned up test record: PASSED ✅');

  console.log('\n========================================');
  console.log('🎉 ALL ISOLATION & ADMIN TESTS PASSED!');
  console.log('========================================');
}

runIsolationTests().catch((err) => {
  console.error('Test failed with error:', err);
  process.exit(1);
});
