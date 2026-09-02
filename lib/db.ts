import { neon } from '@neondatabase/serverless';
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
      ticket_type VARCHAR(50) DEFAULT 'General Access',
      checked_in BOOLEAN DEFAULT FALSE,
      payment_id VARCHAR(255),
      order_id VARCHAR(255),
      payment_status VARCHAR(50) DEFAULT 'PAID',
      amount_paid VARCHAR(50),
      currency VARCHAR(10) DEFAULT 'INR',
      created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
    );
  `;

  await sql`
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
  `;

  await sql`
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
  `;

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

  try {
    const existingEvents = await sql`SELECT COUNT(*)::int as count FROM events;`;
    if (existingEvents && existingEvents[0]?.count === 0) {
      const defaultFormFields: FormFields = {
        name: { enabled: true, required: true },
        email: { enabled: true, required: true },
        phone: { enabled: true, required: true },
        age: { enabled: true, required: false },
        organization: { enabled: true, required: false },
        role: { enabled: true, required: false },
        dietary: { enabled: false, required: false },
        tshirt_size: { enabled: false, required: false },
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

      await sql`
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
          ${startDate},
          ${endDate},
          ${deadline},
          250,
          'published',
          ${JSON.stringify(defaultFormFields)},
          ${JSON.stringify(defaultSessions)}
        );
      `;
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
  const rows = await sql`
    SELECT e.*, 
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    WHERE e.slug = ${slug}
    LIMIT 1;
  `;
  if (!rows || rows.length === 0) return null;
  return rows[0] as unknown as Event;
}

export async function getAllPublishedEvents(): Promise<Event[]> {
  await ensureAllTablesExist();
  const rows = await sql`
    SELECT e.*,
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    WHERE e.status = 'published'
    ORDER BY e.start_date ASC;
  `;
  return rows as unknown as Event[];
}

export async function getAllEventsAdmin(): Promise<Event[]> {
  await ensureAllTablesExist();
  const rows = await sql`
    SELECT e.*,
      (SELECT COUNT(*)::int FROM event_registrations er WHERE er.event_id = e.id) as registration_count
    FROM events e
    ORDER BY e.created_at DESC;
  `;
  return rows as unknown as Event[];
}

export async function generateAttendeeId(eventId: number): Promise<string> {
  const result = await sql`
    SELECT COUNT(*)::int as count FROM event_registrations WHERE event_id = ${eventId};
  `;
  const nextNum = (result[0]?.count || 0) + 1;
  return 'REG-' + String(nextNum).padStart(5, '0');
}
