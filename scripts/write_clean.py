import os

def save(p, content):
    d = os.path.dirname(p)
    if d and not os.path.exists(d):
        os.makedirs(d, exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f:
        f.write(content.strip() + '\n')
    print(f'Saved: {p}')

# 1. lib/db.ts
save('lib/db.ts', """import { neon } from '@neondatabase/serverless';
import { Event, EventRegistration, FormFields, SessionTrack } from '@/types';

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL is not set in environment variables');
}

export const sql = neon(databaseUrl || '');

export interface Registration {
  id: number;
  name: string;
  email: string;
  phone: string;
  age: number;
  organization?: string | null;
  role?: string | null;
  notes?: string | null;
  ticket_type?: string | null;
  checked_in?: boolean | null;
  payment_id?: string | null;
  order_id?: string | null;
  payment_status?: string | null;
  amount_paid?: string | null;
  currency?: string | null;
  created_at: string;
}

let tableChecked = false;

export async function ensureAllTablesExist() {
  if (tableChecked) return;

  // 1. Legacy registrations table
  await sql
    CREATE TABLE IF NOT EXISTS registrations (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      phone VARCHAR(50) NOT NULL,
      age INTEGER NOT NULL,
      organization VARCHAR(255),
      role VARCHAR(255),
      notes TEXT,
      ticket_type VARCHAR(50) DEFAULT 'General Access',
      checked_in BOOLEAN DEFAULT FALSE,
      payment_id VARCHAR(255),
      order_id VARCHAR(255),
      payment_status VARCHAR(50) DEFAULT 'PAID',
      amount_paid VARCHAR(50),
      currency VARCHAR(10) DEFAULT 'INR',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  ;

  // 2. Events table
  await sql
    CREATE TABLE IF NOT EXISTS events (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT,
      media_url TEXT,
      media_type VARCHAR(10) DEFAULT 'video',
      start_date TIMESTAMPTZ NOT NULL,
      end_date TIMESTAMPTZ NOT NULL,
      registration_deadline TIMESTAMPTZ,
      max_capacity INTEGER DEFAULT 0,
      status VARCHAR(20) DEFAULT 'draft',
      form_fields JSONB DEFAULT '{}',
      sessions JSONB DEFAULT '[]',
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
    );
  ;

  // 3. Event Registrations table
  await sql
    CREATE TABLE IF NOT EXISTS event_registrations (
      id SERIAL PRIMARY KEY,
      event_id INTEGER REFERENCES events(id) ON DELETE CASCADE,
      attendee_id VARCHAR(20) UNIQUE,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(50),
      age INTEGER,
      organization VARCHAR(255),
      role VARCHAR(255),
      notes TEXT,
      dietary VARCHAR(100),
      tshirt_size VARCHAR(20),
      interest_tags JSONB DEFAULT '[]',
      session_wishlist JSONB DEFAULT '[]',
      custom_fields JSONB DEFAULT '{}',
      checked_in BOOLEAN DEFAULT FALSE,
      is_early_bird BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
      UNIQUE(event_id, email)
    );
  ;

  // Seed showcase event if none exists
  try {
    const existingEvents = await sqlSELECT COUNT(*)::int as count FROM events;;
    if (existingEvents && existingEvents[0]?.count === 0) {
      const defaultFormFields: FormFields = {
        name: { enabled: true, required: true },
        email: { enabled: true, required: true },
        phone: { enabled: true, required: true },
        age: { enabled: true, required: false },
        organization: { enabled: true, required: false },
        role: { enabled: true, required: false },
        dietary: { enabled: true, required: false },
        tshirt_size: { enabled: true, required: false },
        notes: { enabled: true, required: false },
      };

      const defaultSessions: SessionTrack[] = [
        {
          id: 's1',
          title: 'Opening Keynote: Next-Gen AI Architectures & Quantum Horizons',
          speaker: 'Dr. Sarah Lin (Chief AI Scientist)',
          time: '10:00 AM - 11:30 AM',
          track: 'Keynote',
        },
        {
          id: 's2',
          title: 'Deep Dive: Distributed Cloud Scaling & Low-Latency Engines',
          speaker: 'Marcus Vance (VP of Infrastructure)',
          time: '01:00 PM - 02:30 PM',
          track: 'Architecture',
        },
        {
          id: 's3',
          title: 'Hands-on Workshop: Building Zero-Trust Security in Cloud Native',
          speaker: 'Elena Rostova (Lead Security Analyst)',
          time: '03:00 PM - 04:30 PM',
          track: 'Workshop',
        },
      ];

      const startDate = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();
      const endDate = new Date(Date.now() + 16 * 24 * 60 * 60 * 1000).toISOString();
      const deadline = new Date(Date.now() + 13 * 24 * 60 * 60 * 1000).toISOString();

      await sql
        INSERT INTO events (
          title, slug, description, media_url, media_type,
          start_date, end_date, registration_deadline, max_capacity,
          status, form_fields, sessions
        ) VALUES (
          'Global Tech & Cloud Summit 2026',
          'global-tech-summit-2026',
          'Join visionary developers, cloud architects, and tech innovators from around the world for 3 days of inspiring keynotes, interactive hands-on workshops, and next-generation tech breakthroughs.',
          'https://res.cloudinary.com/dnv6jxv52/video/upload/v1788367107/Untitled_design.mp4',
          'video',
          ,
          ,
          ,
          250,
          'published',
          ,
          
        );
      ;
    }
  } catch (e) {
    console.error('Error seeding default event:', e);
  }

  tableChecked = true;
}

export async function ensureTableExists() {
  await ensureAllTablesExist();
}

export async function getEventBySlug(slug: string): Promise<Event | null> {
  await ensureAllTablesExist();
  const rows = await sql
    SELECT e.*, 
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    WHERE e.slug = 
    LIMIT 1;
  ;
  if (!rows || rows.length === 0) return null;
  return rows[0] as unknown as Event;
}

export async function getAllPublishedEvents(): Promise<Event[]> {
  await ensureAllTablesExist();
  const rows = await sql
    SELECT e.*,
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    WHERE e.status = 'published'
    ORDER BY e.start_date ASC;
  ;
  return rows as unknown as Event[];
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  await ensureAllTablesExist();
  const rows = await sql
    SELECT e.*,
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    ORDER BY e.created_at DESC;
  ;
  return rows as unknown as Event[];
}

export async function generateAttendeeId(eventId: number): Promise<string> {
  const result = await sql
    SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = ;
  ;
  const nextNum = (result[0]?.count || 0) + 1;
  return 'REG-' + String(nextNum).padStart(5, '0');
}
""")

# 2. app/api/events/[slug]/route.ts
save('app/api/events/[slug]/route.ts', """import { NextRequest, NextResponse } from 'next/server';
import { getEventBySlug, ensureAllTablesExist, sql } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    await ensureAllTablesExist();
    const { slug } = await params;
    const event = await getEventBySlug(slug);

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    const recentAttendees = await sql
      SELECT name, organization, created_at 
      FROM event_registrations 
      WHERE event_id =  
      ORDER BY created_at DESC 
      LIMIT 8;
    ;

    const maskedAttendees = (recentAttendees || []).map((att: any) => {
      const parts = (att.name || '').trim().split(' ');
      const maskedName = parts.length > 1 
        ? parts[0] + ' ' + parts[parts.length - 1][0] + '.'
        : parts[0];
      return {
        name: maskedName,
        organization: att.organization || null,
      };
    });

    return NextResponse.json({ 
      event: {
        ...event,
        recent_attendees: maskedAttendees
      } 
    });
  } catch (error: any) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch event' }, { status: 500 });
  }
}
""")

# 3. app/api/admin/events/route.ts
save('app/api/admin/events/route.ts', """import { NextRequest, NextResponse } from 'next/server';
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

    const existing = await sqlSELECT id FROM events WHERE slug =  LIMIT 1;;
    if (existing && existing.length > 0) {
      slug = slug + '-' + Math.floor(Math.random() * 9000 + 1000);
    }

    const formFieldsJson = JSON.stringify(form_fields || {});
    const sessionsJson = JSON.stringify(sessions || []);

    const inserted = await sql
      INSERT INTO events (
        title, slug, description, media_url, media_type,
        start_date, end_date, registration_deadline, max_capacity,
        status, form_fields, sessions
      ) VALUES (
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        
      )
      RETURNING *;
    ;

    return NextResponse.json({ event: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
""")

# 4. app/api/admin/events/[id]/route.ts
save('app/api/admin/events/[id]/route.ts', """import { NextRequest, NextResponse } from 'next/server';
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

    const updated = await sql
      UPDATE events SET
        title = ,
        slug = ,
        description = ,
        media_url = ,
        media_type = ,
        start_date = ,
        end_date = ,
        registration_deadline = ,
        max_capacity = ,
        status = ,
        form_fields = ,
        sessions = 
      WHERE id = 
      RETURNING *;
    ;

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

    await sql
      UPDATE events SET status = 'archived' WHERE id = ;
    ;

    return NextResponse.json({ success: true, message: 'Event archived' });
  } catch (error: any) {
    console.error('Error archiving event:', error);
    return NextResponse.json({ error: error.message || 'Failed to archive event' }, { status: 500 });
  }
}
""")

# 5. app/api/registrations/create/route.ts
save('app/api/registrations/create/route.ts', """import { NextRequest, NextResponse } from 'next/server';
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

    const eventRows = await sql
      SELECT * FROM events WHERE id =  LIMIT 1;
    ;
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

    const countRes = await sql
      SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = ;
    ;
    const currentCount = countRes[0]?.count || 0;
    if (event.max_capacity > 0 && currentCount >= event.max_capacity) {
      return NextResponse.json({ error: 'Event has reached maximum capacity' }, { status: 400 });
    }

    const existing = await sql
      SELECT id FROM event_registrations 
      WHERE event_id =  AND LOWER(email) = LOWER() 
      LIMIT 1;
    ;
    if (existing && existing.length > 0) {
      return NextResponse.json({ 
        error: 'You have already registered for this event. Use "Find My Pass" to view your ticket.' 
      }, { status: 409 });
    }

    const attendeeId = await generateAttendeeId(event.id);
    const isEarlyBird = currentCount < 50;

    const interestTagsJson = JSON.stringify(interest_tags || []);
    const sessionWishlistJson = JSON.stringify(session_wishlist || []);
    const customFieldsJson = JSON.stringify(custom_fields || {});

    const inserted = await sql
      INSERT INTO event_registrations (
        event_id, attendee_id, name, email, phone, age,
        organization, role, notes, dietary, tshirt_size,
        interest_tags, session_wishlist, custom_fields,
        checked_in, is_early_bird
      ) VALUES (
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        ,
        FALSE,
        
      )
      RETURNING *;
    ;

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
""")

# 6. app/api/registrations/lookup/route.ts
save('app/api/registrations/lookup/route.ts', """import { NextRequest, NextResponse } from 'next/server';
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
      query = await sql
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER() AND er.event_id = 
        LIMIT 1;
      ;
    } else {
      query = await sql
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER()
        ORDER BY er.created_at DESC
        LIMIT 1;
      ;
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
""")

print('Python successfully wrote all 6 backend files!')