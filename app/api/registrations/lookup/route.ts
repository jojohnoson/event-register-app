import { NextRequest, NextResponse } from 'next/server';
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
      query = await sql`
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER(${email.trim()}) AND er.event_id = ${parseInt(eventId, 10)}
        LIMIT 1;
      `;
    } else {
      query = await sql`
        SELECT er.*, e.title as event_title, e.start_date as event_start_date, e.end_date as event_end_date
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = LOWER(${email.trim()})
        ORDER BY er.created_at DESC
        LIMIT 1;
      `;
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
