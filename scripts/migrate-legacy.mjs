import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

async function migrate() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL not found in .env.local');
    process.exit(1);
  }

  const sql = neon(databaseUrl);
  console.log('Connecting to Neon DB for legacy migration...');

  // 1. Ensure default event exists
  let events = await sql`SELECT id, title, slug FROM events ORDER BY id ASC LIMIT 1;`;
  let targetEventId;
  if (!events || events.length === 0) {
    console.log('Creating default event for legacy registrations...');
    const inserted = await sql`
      INSERT INTO events (
        title, slug, description, start_date, end_date, registration_deadline, max_capacity, status
      ) VALUES (
        'Global Tech & Cloud Summit 2026',
        'global-tech-summit-2026',
        'Unified global summit featuring cloud computing, distributed architecture, and AI.',
        NOW() + INTERVAL '14 days',
        NOW() + INTERVAL '16 days',
        NOW() + INTERVAL '13 days',
        250,
        'published'
      ) RETURNING id, title;
    `;
    targetEventId = inserted[0].id;
  } else {
    targetEventId = events[0].id;
  }
  console.log(`Target event ID for migration: ${targetEventId} (${events[0]?.title || 'Default Event'})`);

  // 2. Fetch all legacy registrations
  const legacyRows = await sql`
    SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
    FROM registrations
    ORDER BY id ASC;
  `;
  console.log(`Found ${legacyRows.length} legacy registration record(s).`);

  let migratedCount = 0;
  let skippedCount = 0;

  for (const row of legacyRows) {
    // Check if already in event_registrations
    const existing = await sql`
      SELECT id FROM event_registrations
      WHERE event_id = ${targetEventId} AND email = ${row.email.trim().toLowerCase()};
    `;

    if (existing && existing.length > 0) {
      skippedCount++;
      continue;
    }

    const attendeeId = `REG-${String(row.id).padStart(5, '0')}`;
    const customFields = JSON.stringify({ legacy_ticket_type: row.ticket_type || 'General Access' });

    await sql`
      INSERT INTO event_registrations (
        event_id, attendee_id, name, email, phone, age,
        organization, role, notes, custom_fields, checked_in, is_early_bird, created_at
      ) VALUES (
        ${targetEventId},
        ${attendeeId},
        ${row.name},
        ${row.email.trim().toLowerCase()},
        ${row.phone},
        ${row.age},
        ${row.organization || null},
        ${row.role || null},
        ${row.notes || null},
        ${customFields},
        ${row.checked_in || false},
        ${row.id <= 100},
        ${row.created_at || new Date().toISOString()}
      );
    `;
    migratedCount++;
  }

  console.log(`Migration Complete:`);
  console.log(`- Migrated: ${migratedCount}`);
  console.log(`- Already existed: ${skippedCount}`);
  console.log(`- Total in event_registrations: ${migratedCount + skippedCount}`);

  // Create audit_logs table if not exists
  await sql`
    CREATE TABLE IF NOT EXISTS audit_logs (
      id SERIAL PRIMARY KEY,
      action VARCHAR(50) NOT NULL,
      details TEXT NOT NULL,
      badge VARCHAR(50),
      event_id INTEGER REFERENCES events(id) ON DELETE SET NULL,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  `;
  console.log('Audit logs table ready.');

  // Insert migration audit log
  await sql`
    INSERT INTO audit_logs (action, details, badge, event_id)
    VALUES (
      'MIGRATION',
      ${'Migrated ' + migratedCount + ' legacy attendee records into unified multi-event platform.'},
      'SYSTEM',
      ${targetEventId}
    );
  `;

  console.log('Migration logged to audit_logs successfully!');
}

migrate().catch(console.error);
