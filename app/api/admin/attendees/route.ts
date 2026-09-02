import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureAllTablesExist } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

// GET attendees across multi-events with search, event filter, org filter, checkin status & real-time stats
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

    // Fetch all events for the dropdown filter
    const allEvents = await sql`
      SELECT id, title, slug, status, max_capacity, start_date FROM events ORDER BY created_at DESC;
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

    // Compute dynamic aggregate stats for the active event scope
    let statsScopeAttendees = attendees;

    // Apply org and checkin filters
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

    // Extract unique organizations
    const orgMap = new Map<string, number>();
    let totalAge = 0;
    let countWithAge = 0;
    let minAge = 999;
    let maxAge = 0;
    let checkedInCount = 0;

    statsScopeAttendees.forEach((a: any) => {
      if (a.checked_in) checkedInCount++;
      if (a.organization && a.organization.trim()) {
        const orgName = a.organization.trim();
        orgMap.set(orgName, (orgMap.get(orgName) || 0) + 1);
      }
      if (a.age && !isNaN(a.age) && a.age > 0) {
        totalAge += a.age;
        countWithAge++;
        if (a.age < minAge) minAge = a.age;
        if (a.age > maxAge) maxAge = a.age;
      }
    });

    const avgAge = countWithAge > 0 ? parseFloat((totalAge / countWithAge).toFixed(1)) : 0;
    const checkedInRatio = statsScopeAttendees.length > 0
      ? Math.round((checkedInCount / statsScopeAttendees.length) * 100)
      : 0;

    return NextResponse.json({
      attendees: filtered,
      totalCount: statsScopeAttendees.length,
      filteredCount: filtered.length,
      stats: {
        total: statsScopeAttendees.length,
        checkedInCount,
        checkedInRatio: `${checkedInRatio}%`,
        organizations: orgMap.size,
        avgAge,
        minAge: minAge === 999 ? 0 : minAge,
        maxAge,
      },
      uniqueOrganizations: Array.from(orgMap.keys()).sort(),
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

    const rec = updated[0];

    // Log to audit_logs
    if (isCheckedIn !== undefined) {
      await sql`
        INSERT INTO audit_logs (action, details, badge, event_id)
        VALUES (
          'CHECKIN',
          ${(isCheckedIn ? 'Checked in ' : 'Unmarked check-in for ') + rec.name + ' (' + (rec.attendee_id || 'REG-' + rec.id) + ')'},
          ${isCheckedIn ? 'CHECKED-IN' : 'PENDING'},
          ${rec.event_id}
        );
      `;
    } else {
      await sql`
        INSERT INTO audit_logs (action, details, badge, event_id)
        VALUES (
          'UPDATE',
          ${'Updated record for ' + rec.name + ' (' + (rec.attendee_id || 'REG-' + rec.id) + ')'},
          'UPDATE',
          ${rec.event_id}
        );
      `;
    }

    return NextResponse.json({ success: true, attendee: rec });
  } catch (error: any) {
    console.error('Error updating attendee:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update attendee' },
      { status: 500 }
    );
  }
}

// POST bulk action (bulk checkin / uncheckin)
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

      await sql`
        INSERT INTO audit_logs (action, details, badge)
        VALUES (
          'CHECKIN',
          ${(isCheckIn ? 'Bulk marked checked-in ' : 'Bulk unmarked check-in for ') + validIds.length + ' attendees'},
          'BULK'
        );
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

// DELETE attendee(s) with double deletion support & audit logging
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

    // Get names for audit log
    const toDelete = await sql`
      SELECT id, name, attendee_id, event_id FROM event_registrations WHERE id = ANY(${idsToDelete});
    `;

    await sql`
      DELETE FROM event_registrations
      WHERE id = ANY(${idsToDelete});
    `;

    // Audit log
    const names = toDelete.map((r: any) => r.name).join(', ');
    await sql`
      INSERT INTO audit_logs (action, details, badge, event_id)
      VALUES (
        'DELETE',
        ${'Double-verified deletion of ' + idsToDelete.length + ' attendee(s): ' + names},
        'PURGE',
        ${toDelete[0]?.event_id || null}
      );
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
