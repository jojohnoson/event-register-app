import { NextRequest, NextResponse } from 'next/server';
import { ensureAllTablesExist, sql } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    await ensureAllTablesExist();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    const eventIdParam = searchParams.get('event_id');

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (eventIdParam && !isNaN(parseInt(eventIdParam, 10))) {
      const eventId = parseInt(eventIdParam, 10);
      const query = await sql`
        SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date, e.end_date as event_end_date, e.status as event_status
        FROM event_registrations er
        JOIN events e ON er.event_id = e.id
        WHERE LOWER(er.email) = ${normalizedEmail} AND er.event_id = ${eventId}
        LIMIT 1;
      `;

      if (!query || query.length === 0) {
        return NextResponse.json({ 
          error: 'No registered pass found for this email address in this specific event.' 
        }, { status: 404 });
      }

      return NextResponse.json({
        success: true,
        isSpecificEvent: true,
        registration: query[0],
        registrations: query,
        count: 1,
      });
    }

    // Global multi-event lookup
    const query = await sql`
      SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date, e.end_date as event_end_date, e.status as event_status
      FROM event_registrations er
      JOIN events e ON er.event_id = e.id
      WHERE LOWER(er.email) = ${normalizedEmail}
      ORDER BY er.created_at DESC;
    `;

    if (!query || query.length === 0) {
      return NextResponse.json({ 
        error: 'No registered passes found for this email address. Please verify your email or register for an event.' 
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      isSpecificEvent: false,
      registrations: query,
      registration: query[0],
      count: query.length,
    });
  } catch (error: any) {
    console.error('Error looking up passes:', error);
    return NextResponse.json({ error: error.message || 'Lookup failed' }, { status: 500 });
  }
}
