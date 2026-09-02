import { NextRequest, NextResponse } from 'next/server';
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

    const existing = await sql`SELECT id FROM events WHERE slug = ${slug} LIMIT 1;`;
    if (existing && existing.length > 0) {
      slug = slug + '-' + Math.floor(Math.random() * 9000 + 1000);
    }

    const formFieldsJson = JSON.stringify(form_fields || {});
    const sessionsJson = JSON.stringify(sessions || []);

    const inserted = await sql`
      INSERT INTO events (
        title, slug, description, media_url, media_type,
        start_date, end_date, registration_deadline, max_capacity,
        status, form_fields, sessions
      ) VALUES (
        ${title},
        ${slug},
        ${description || ''},
        ${media_url || ''},
        ${media_type || 'video'},
        ${start_date},
        ${end_date},
        ${registration_deadline || null},
        ${parseInt(max_capacity || 0, 10)},
        ${status || 'draft'},
        ${formFieldsJson},
        ${sessionsJson}
      )
      RETURNING *;
    `;

    return NextResponse.json({ event: inserted[0] }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to create event' }, { status: 500 });
  }
}
