import { neon } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const sql = neon(process.env.DATABASE_URL);

async function generateAttendeeId(eventId) {
  const rows = await sql`
    SELECT attendee_id FROM event_registrations WHERE event_id = ${eventId};
  `;

  let maxNum = 0;
  const existingSet = new Set();

  for (const row of rows) {
    if (row.attendee_id) {
      existingSet.add(row.attendee_id);
      const match = row.attendee_id.match(/REG-(\d+)/i);
      if (match) {
        const num = parseInt(match[1], 10);
        if (!isNaN(num) && num > maxNum) {
          maxNum = num;
        }
      }
    }
  }

  let nextNum = maxNum + 1;
  let candidate = 'REG-' + String(nextNum).padStart(5, '0');

  while (existingSet.has(candidate)) {
    nextNum++;
    candidate = 'REG-' + String(nextNum).padStart(5, '0');
  }

  return candidate;
}

async function simulateCreate(eventId) {
  const name = "Jo";
  const email = "joeljohnson2514@gmail.com";
  const phone = "+916379013930";
  const age = "21";
  const organization = "Internshala";
  const role = "Data Engineer";
  const notes = "Nothing";

  console.log(`\nSimulating registration for event_id = ${eventId}...`);
  const attendeeId = await generateAttendeeId(eventId);
  console.log(`Generated Attendee ID: ${attendeeId}`);

  try {
    const inserted = await sql`
      INSERT INTO event_registrations (
        event_id, attendee_id, name, email, phone, age,
        organization, role, notes, dietary, tshirt_size,
        interest_tags, session_wishlist, custom_fields,
        checked_in, is_early_bird
      ) VALUES (
        ${eventId},
        ${attendeeId},
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone || null},
        ${age ? parseInt(age, 10) : null},
        ${organization || null},
        ${role || null},
        ${notes || null},
        ${null},
        ${null},
        ${JSON.stringify([])},
        ${JSON.stringify([])},
        ${JSON.stringify({})},
        FALSE,
        ${true}
      )
      RETURNING *;
    `;
    console.log(`SUCCESS! Inserted id = ${inserted[0].id}, attendee_id = ${inserted[0].attendee_id}`);
    
    // Clean up
    await sql`DELETE FROM event_registrations WHERE id = ${inserted[0].id}`;
    console.log('Cleaned up test record.');
  } catch (err) {
    console.error('ERROR during insert:', err);
  }
}

async function run() {
  await simulateCreate(1);
  await simulateCreate(3);
}

run().catch(console.error);
