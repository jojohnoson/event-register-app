import fs from 'fs';
import path from 'path';

function writeFile(filePath, content) {
  const dir = path.dirname(filePath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Wrote: ${filePath}`);
}

// 1. app/api/admin/events/route.ts
writeFile('app/api/admin/events/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { getAllEventsAdmin, ensureAllTablesExist, sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const events = await getAllEventsAdmin();
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching admin events:', error);
    return NextResponse.json({ error: error.message || 'Server error' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const body = await request.json();

    let {
      title,
      slug,
      description,
      media_url,
      media_type,
      start_date,
      end_date,
      registration_deadline,
      max_capacity,
      status,
      form_fields,
      sessions
    } = body;

    if (!title || !start_date || !end_date) {
      return NextResponse.json({ error: 'Title, start date, and end date are required' }, { status: 400 });
    }

    if (!slug) {
      slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    } else {
      slug = slug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    const existing = await sql\`SELECT id FROM events WHERE slug = \${slug} LIMIT 1;\`;
    if (existing && existing.length > 0) {
      slug = \`\${slug}-\${Math.floor(Math.random() * 9000 + 1000)}\`;
    }

    const formFieldsJson = JSON.stringify(form_fields || {});
    const sessionsJson = JSON.stringify(sessions || []);

    const inserted = await sql\`
      INSERT INTO events (
        title, slug, description, media_url, media_type,
        start_date, end_date, registration_deadline, max_capacity,
        status, form_fields, sessions
      ) VALUES (
        \${title},
        \${slug},
        \${description || ''},
        \${media_url || ''},
        \${media_type || 'video'},
        \${start_date},
        \${end_date},
        \${registration_deadline || null},
        \${parseInt(max_capacity || 0, 10)},
        \${status || 'draft'},
        \${formFieldsJson},
        \${sessionsJson}
      )
      RETURNING *;
    \`;

    return NextResponse.json({ event: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
`);

// 2. app/api/admin/events/[id]/route.ts
writeFile('app/api/admin/events/[id]/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { ensureAllTablesExist, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      slug,
      description,
      media_url,
      media_type,
      start_date,
      end_date,
      registration_deadline,
      max_capacity,
      status,
      form_fields,
      sessions
    } = body;

    const formFieldsJson = JSON.stringify(form_fields || {});
    const sessionsJson = JSON.stringify(sessions || []);

    const updated = await sql\`
      UPDATE events SET
        title = \${title},
        slug = \${slug},
        description = \${description || ''},
        media_url = \${media_url || ''},
        media_type = \${media_type || 'video'},
        start_date = \${start_date},
        end_date = \${end_date},
        registration_deadline = \${registration_deadline || null},
        max_capacity = \${parseInt(max_capacity || 0, 10)},
        status = \${status || 'draft'},
        form_fields = \${formFieldsJson},
        sessions = \${sessionsJson}
      WHERE id = \${parseInt(id, 10)}
      RETURNING *;
    \`;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: updated[0] });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const { id } = await params;

    await sql\`
      UPDATE events SET status = 'archived' WHERE id = \${parseInt(id, 10)};
    \`;

    return NextResponse.json({ success: true, message: 'Event archived' });
  } catch (error: any) {
    console.error('Error archiving event:', error);
    return NextResponse.json({ error: error.message || 'Failed to archive event' }, { status: 500 });
  }
}
`);

// 3. app/api/registrations/create/route.ts
writeFile('app/api/registrations/create/route.ts', `import { NextRequest, NextResponse } from 'next/server';
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
      interest_tags,
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

    // Check event status
    const eventRows = await sql\`
      SELECT * FROM events WHERE id = \${parseInt(event_id, 10)} LIMIT 1;
    \`;
    if (!eventRows || eventRows.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    const event = eventRows[0];

    if (event.status !== 'published') {
      return NextResponse.json({ error: 'Registration is not open for this event' }, { status: 400 });
    }

    // Check deadline
    if (event.registration_deadline) {
      const deadline = new Date(event.registration_deadline).getTime();
      if (Date.now() > deadline) {
        return NextResponse.json({ error: 'Registration deadline has passed' }, { status: 400 });
      }
    }

    // Check max capacity
    const countRes = await sql\`
      SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = \${event.id};
    \`;
    const currentCount = countRes[0]?.count || 0;
    if (event.max_capacity > 0 && currentCount >= event.max_capacity) {
      return NextResponse.json({ error: 'Event has reached maximum capacity' }, { status: 400 });
    }

    // Check duplicate registration
    const existing = await sql\`
      SELECT id FROM event_registrations 
      WHERE event_id = \${event.id} AND LOWER(email) = LOWER(\${email.trim()}) 
      LIMIT 1;
    \`;
    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'You have already registered for this event. Use "Find My Pass" to view your ticket.' 
      }, { status: 409 });
    }

    // Generate unique Attendee ID (e.g. REG-00015)
    const attendeeId = await generateAttendeeId(event.id);

    // Early bird bonus check (first 50 attendees get early bird flag)
    const isEarlyBird = currentCount < 50;

    const interestTagsJson = JSON.stringify(interest_tags || []);
    const sessionWishlistJson = JSON.stringify(session_wishlist || []);
    const customFieldsJson = JSON.stringify(custom_fields || {});

    const inserted = await sql\`
      INSERT INTO event_registrations (
        event_id, attendee_id, name, email, phone, age,
        organization, role, notes, dietary, tshirt_size,
        interest_tags, session_wishlist, custom_fields,
        checked_in, is_early_bird
      ) VALUES (
        \${event.id},
        \${attendeeId},
        \${name.trim()},
        \${email.trim().toLowerCase()},
        \${phone || null},
        \${age ? parseInt(age, 10) : null},
        \${organization || null},
        \${role || null},
        \${notes || null},
        \${dietary || null},
        \${tshirt_size || null},
        \${interestTagsJson},
        \${sessionWishlistJson},
        \${customFieldsJson},
        FALSE,
        \${isEarlyBird}
      )
      RETURNING *;
    \`;

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
`);

// 4. app/api/registrations/lookup/route.ts
writeFile('app/api/registrations/lookup/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import { ensureAllTablesExist, sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await ensureAllTablesExist();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const eventId = searchParams.get('event_id');

    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    let query;
    if (eventId) {
      query = await sql\`
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER(\${email.trim()}) AND er.event_id = \${parseInt(eventId, 10)}
        LIMIT 1;
      \`;
    } else {
      query = await sql\`
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER(\${email.trim()})
        ORDER BY er.created_at DESC
        LIMIT 1;
      \`;
    }

    if (!query || query.length === 0) {
      return NextResponse.json({ error: 'No pass found for this email' }, { status: 404 });
    }

    return NextResponse.json({ registration: query[0] });
  } catch (error: any) {
    console.error('Error looking up pass:', error);
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
`);

// 5. app/api/registrations/qr/route.ts
writeFile('app/api/registrations/qr/route.ts', `import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attendeeId = searchParams.get('attendee_id');

    if (!attendeeId) {
      return NextResponse.json({ error: 'attendee_id is required' }, { status: 400 });
    }

    // High quality QR code with amber accent styling
    const qrDataUrl = await QRCode.toDataURL(attendeeId, {
      width: 280,
      margin: 2,
      color: {
        dark: '#f59e0b',
        light: '#080a0f',
      },
    });

    return NextResponse.json({ qrDataUrl });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
`);

console.log('All backend API routes written successfully!');