import { NextRequest, NextResponse } from 'next/server';
import { ensureAllTablesExist, generateAttendeeId, sql } from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    await ensureAllTablesExist();
    const body = await request.json();

    const {
      event_id,
      name,
      email,
      phone,
      age,
      organization,
      role,
      notes,
      dietary,
      tshirt_size,
      session_wishlist,
      custom_fields,
    } = body;

    if (!event_id) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }
    if (!name || !name.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 });
    }

    const eventRows = await sql`
      SELECT * FROM events WHERE id = ${parseInt(event_id, 10)} LIMIT 1;
    `;
    if (!eventRows || eventRows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = eventRows[0];

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Registration is not open for this event' }, { status: 400 });
    }

    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline).getTime();
      if (Date.now() > deadline) {
        return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
      }
    }

    const countRes = await sql`
      SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = ${event.id};
    `;
    const currentCount = countRes[0]?.count || 0;
    if (event.max_capacity > 0 && currentCount >= event.max_capacity) {
      return NextResponse.json({ error: 'Event has reached maximum capacity' }, { status: 400 });
    }

    const existing = await sql`
      SELECT id FROM event_registrations 
      WHERE event_id = ${event.id} AND LOWER(email) = LOWER(${email.trim()}) 
      LIMIT 1;
    `;
    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'You are already registered for this event.' 
      }, { status: 409 });
    }

    // ── Live DB migration: replace the broken single-column unique constraint
    // on attendee_id with the correct composite (event_id, attendee_id) one.
    // This is idempotent — safe to run on every request until the constraint is fixed.
    try {
      await sql`
        ALTER TABLE event_registrations
          DROP CONSTRAINT IF EXISTS event_registrations_attendee_id_key;
      `;
      await sql`
        ALTER TABLE event_registrations
          DROP CONSTRAINT IF EXISTS event_registrations_event_id_attendee_id_key;
      `;
      await sql`
        ALTER TABLE event_registrations
          ADD CONSTRAINT event_registrations_event_id_attendee_id_key
          UNIQUE (event_id, attendee_id);
      `;
    } catch (_migErr) {
      // Constraint already in the correct state — safe to continue
    }

    const attendeeId = await generateAttendeeId(event.id);
    const isEarlyBird = currentCount < 50;

    const sessionWishlistJson = JSON.stringify(session_wishlist || []);
    const customFieldsJson = JSON.stringify(custom_fields || {});

    const inserted = await sql`
      INSERT INTO event_registrations (
        event_id, attendee_id, name, email, phone, age,
        organization, role, notes, dietary, tshirt_size,
        session_wishlist, custom_fields,
        checked_in, is_early_bird
      ) VALUES (
        ${event.id},
        ${attendeeId},
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone || null},
        ${age ? parseInt(age, 10) : null},
        ${organization || null},
        ${role || null},
        ${notes || null},
        ${dietary || null},
        ${tshirt_size || null},
        ${sessionWishlistJson},
        ${customFieldsJson},
        FALSE,
        ${isEarlyBird}
      )
      RETURNING *;
    `;

    const registration = inserted[0];

    return NextResponse.json({
      success: true,
      registration: {
        ...registration,
        event_title: event.title,
        event_start_date: event.start_date,
        event_end_date: event.end_date,
      },
      event,
    }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating registration:', error);
    return NextResponse.json({ error: error.message || 'Registration failed' }, { status: 500 });
  }
}
