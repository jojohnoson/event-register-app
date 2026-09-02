import { NextRequest, NextResponse } from 'next/server';
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

    const recentAttendees = await sql`
      SELECT name, organization, created_at 
      FROM event_registrations 
      WHERE event_id = ${event.id} 
      ORDER BY created_at DESC 
      LIMIT 8;
    `;

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
