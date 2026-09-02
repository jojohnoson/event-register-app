import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureAllTablesExist } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

// GET attendees across multi-events with search, event filter, org filter, and checkin status
export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required.' },
        { status: 401 }
      );
    }

    await ensureAllTablesExist();

    const { searchParams } = new URL(request.url);
    const eventIdParam = searchParams.get('event_id');
    const query = searchParams.get('q')?.trim();
    const org = searchParams.get('org')?.trim();
    const checkin = searchParams.get('checkin')?.trim();

    const eventId = eventIdParam && eventIdParam !== 'ALL' && !isNaN(parseInt(eventIdParam, 10))
      ? parseInt(eventIdParam, 10)
      : null;

    // Fetch all published/active events for the dropdown filter
    const allEvents = await sql`
      SELECT id, title, slug, status FROM events ORDER BY created_at DESC;
    `;

    // Fetch attendees with event title
    let attendees;
    const searchPattern = query ? `%${query}%` : null;

    if (eventId) {
      if (searchPattern) {
        attendees = await sql`
          SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date
          FROM event_registrations er
          JOIN events e ON er.event_id = e.id
          WHERE er.event_id = ${eventId}
            AND (
              er.name ILIKE ${searchPattern} OR
              er.email ILIKE ${searchPattern} OR
              er.phone ILIKE ${searchPattern} OR
              er.attendee_id ILIKE ${searchPattern} OR
              er.organization ILIKE ${searchPattern} OR
              er.role ILIKE ${searchPattern} OR
              er.notes ILIKE ${searchPattern}
            )
          ORDER BY er.created_at DESC;
        `;
      } else {
        attendees = await sql`
          SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date
          FROM event_registrations er
          JOIN events e ON er.event_id = e.id
          WHERE er.event_id = ${eventId}
          ORDER BY er.created_at DESC;
        `;
      }
    } else {
      if (searchPattern) {
        attendees = await sql`
          SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date
          FROM event_registrations er
          JOIN events e ON er.event_id = e.id
          WHERE (
            er.name ILIKE ${searchPattern} OR
            er.email ILIKE ${searchPattern} OR
            er.phone ILIKE ${searchPattern} OR
            er.attendee_id ILIKE ${searchPattern} OR
            er.organization ILIKE ${searchPattern} OR
            er.role ILIKE ${searchPattern} OR
            er.notes ILIKE ${searchPattern}
          )
          ORDER BY er.created_at DESC;
        `;
      } else {
        attendees = await sql`
          SELECT er.*, e.title as event_title, e.slug as event_slug, e.start_date as event_start_date
          FROM event_registrations er
          JOIN events e ON er.event_id = e.id
          ORDER BY er.created_at DESC;
        `;
      }
    }

    // Apply org and checkin filters in memory if requested
    let filtered = attendees;
    if (org && org !== 'ALL') {
      filtered = filtered.filter(
        (a: any) => (a.organization || '').toLowerCase() === org.toLowerCase()
      );
    }
    if (checkin && checkin !== 'ALL') {
      if (checkin === 'CHECKED_IN') {
        filtered = filtered.filter((a: any) => a.checked_in === true);
      } else if (checkin === 'PENDING') {
        filtered = filtered.filter((a: any) => !a.checked_in);
      }
    }

    // Extract unique organizations for filter dropdown
    const orgSet = new Set<string>();
    attendees.forEach((a: any) => {
      if (a.organization && a.organization.trim()) {
        orgSet.add(a.organization.trim());
      }
    });

    const checkedInCount = attendees.filter((a: any) => a.checked_in).length;

    return NextResponse.json({
      attendees: filtered,
      totalCount: attendees.length,
      filteredCount: filtered.length,
      checkedInCount,
      uniqueOrganizations: Array.from(orgSet).sort(),
      events: allEvents,
    });
  } catch (error: any) {
    console.error('Error fetching event attendees:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch attendees' },
      { status: 500 }
    );
  }
}

// PATCH update single attendee (e.g. check-in status or details)
export async function PATCH(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const body = await request.json();
    const { id, checked_in, name, email, phone, age, organization, role, notes } = body;

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid attendee ID is required' }, { status: 400 });
    }

    const attendeeIdInt = parseInt(id, 10);
    const parsedAge = age !== undefined && age !== null ? parseInt(age, 10) : undefined;
    const isCheckedIn = typeof checked_in === 'boolean' ? checked_in : undefined;

    const updated = await sql`
      UPDATE event_registrations
      SET
        checked_in = COALESCE(${isCheckedIn}, checked_in),
        name = COALESCE(${name?.trim()}, name),
        email = COALESCE(${email ? email.trim().toLowerCase() : undefined}, email),
        phone = COALESCE(${phone?.trim()}, phone),
        age = COALESCE(${parsedAge}, age),
        organization = COALESCE(${organization?.trim()}, organization),
        role = COALESCE(${role?.trim()}, role),
        notes = COALESCE(${notes?.trim()}, notes)
      WHERE id = ${attendeeIdInt}
      RETURNING *;
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Attendee not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, attendee: updated[0] });
  } catch (error: any) {
    console.error('Error updating attendee:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update attendee' },
      { status: 500 }
    );
  }
}

// POST bulk action (e.g. bulk checkin / uncheckin)
export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const body = await request.json();
    const { action, ids } = body;

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'Valid attendee IDs array required' }, { status: 400 });
    }

    const validIds = ids.map((id: any) => parseInt(id, 10)).filter((id: number) => !isNaN(id));

    if (action === 'checkin' || action === 'uncheckin') {
      const isCheckIn = action === 'checkin';
      await sql`
        UPDATE event_registrations
        SET checked_in = ${isCheckIn}
        WHERE id = ANY(${validIds});
      `;
      return NextResponse.json({ success: true, updated: validIds.length });
    }

    return NextResponse.json({ error: 'Unsupported bulk action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error in bulk attendee action:', error);
    return NextResponse.json(
      { error: error?.message || 'Bulk action failed' },
      { status: 500 }
    );
  }
}

// DELETE attendee(s) with double deletion support
export async function DELETE(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();

    const { searchParams } = new URL(request.url);
    const queryId = searchParams.get('id');

    let idsToDelete: number[] = [];

    if (queryId) {
      const parsed = parseInt(queryId, 10);
      if (!isNaN(parsed)) {
        idsToDelete.push(parsed);
      }
    } else {
      // Check if IDs provided in JSON body
      try {
        const body = await request.json();
        if (Array.isArray(body?.ids)) {
          idsToDelete = body.ids
            .map((i: any) => parseInt(i, 10))
            .filter((i: number) => !isNaN(i));
        }
      } catch {}
    }

    if (idsToDelete.length === 0) {
      return NextResponse.json({ error: 'Valid attendee ID(s) required' }, { status: 400 });
    }

    await sql`
      DELETE FROM event_registrations
      WHERE id = ANY(${idsToDelete});
    `;

    return NextResponse.json({
      success: true,
      message: `Successfully deleted ${idsToDelete.length} attendee record(s).`,
      deletedIds: idsToDelete,
    });
  } catch (error: any) {
    console.error('Error deleting attendee(s):', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete attendee record(s)' },
      { status: 500 }
    );
  }
}
