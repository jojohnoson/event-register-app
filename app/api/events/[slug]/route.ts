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

    // Privacy-safe metrics: strictly count-based, NO attendee names
    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_registered,
        COUNT(DISTINCT organization)::int as total_orgs
      FROM event_registrations 
      WHERE event_id = ${event.id};
    `;

    const recentOrgs = await sql`
      SELECT DISTINCT organization 
      FROM event_registrations 
      WHERE event_id = ${event.id} AND organization IS NOT NULL AND TRIM(organization) != ''
      LIMIT 5;
    `;

    const totalRegistered = statsResult[0]?.total_registered || 0;
    const totalOrgs = statsResult[0]?.total_orgs || 0;
    const orgNames = recentOrgs.map((r: any) => r.organization);

    return NextResponse.json({ 
      event: {
        ...event,
        registration_count: totalRegistered,
        organizations_count: totalOrgs,
        recent_organizations: orgNames,
      } 
    });
  } catch (error: any) {
    console.error('Error fetching event by slug:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch event' }, { status: 500 });
  }
}
