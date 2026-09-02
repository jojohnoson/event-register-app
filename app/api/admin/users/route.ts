import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

// GET all registered users (Admin Only)
export async function GET(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required to view attendee directory.' },
        { status: 401 }
      );
    }

    await ensureTableExists();

    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();
    const organization = searchParams.get('org')?.trim();

    let users;
    if (query && organization) {
      const searchPattern = `%${query}%`;
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE 
          (name ILIKE ${searchPattern} OR
           email ILIKE ${searchPattern} OR
           phone ILIKE ${searchPattern} OR
           role ILIKE ${searchPattern} OR
           ticket_type ILIKE ${searchPattern} OR
           notes ILIKE ${searchPattern}) AND
          organization ILIKE ${`%${organization}%`}
        ORDER BY created_at DESC;
      `;
    } else if (query) {
      const searchPattern = `%${query}%`;
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE 
          name ILIKE ${searchPattern} OR
          email ILIKE ${searchPattern} OR
          phone ILIKE ${searchPattern} OR
          organization ILIKE ${searchPattern} OR
          role ILIKE ${searchPattern} OR
          ticket_type ILIKE ${searchPattern} OR
          notes ILIKE ${searchPattern}
        ORDER BY created_at DESC;
      `;
    } else if (organization) {
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE organization ILIKE ${`%${organization}%`}
        ORDER BY created_at DESC;
      `;
    } else {
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        ORDER BY created_at DESC;
      `;
    }

    // Comprehensive Stats for Admin Dashboard
    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_count,
        COUNT(DISTINCT organization)::int as total_organizations,
        COALESCE(ROUND(AVG(age), 1)::float, 0) as average_age,
        MIN(age)::int as min_age,
        MAX(age)::int as max_age,
        COUNT(CASE WHEN checked_in = TRUE THEN 1 END)::int as checked_in_count
      FROM registrations;
    `;

    // Top organizations breakdown
    const orgBreakdown = await sql`
      SELECT COALESCE(organization, 'Individual') as org_name, COUNT(*)::int as member_count
      FROM registrations
      GROUP BY COALESCE(organization, 'Individual')
      ORDER BY member_count DESC
      LIMIT 6;
    `;

    // Ticket tier breakdown
    const tierBreakdown = await sql`
      SELECT COALESCE(ticket_type, 'General Access') as tier_name, COUNT(*)::int as count
      FROM registrations
      GROUP BY COALESCE(ticket_type, 'General Access')
      ORDER BY count DESC;
    `;

    const stats = statsResult[0] || {
      total_count: 0,
      total_organizations: 0,
      average_age: 0,
      min_age: 0,
      max_age: 0,
      checked_in_count: 0,
    };

    return NextResponse.json({
      users,
      stats: {
        total: stats.total_count || 0,
        organizations: stats.total_organizations || 0,
        avgAge: stats.average_age || 0,
        minAge: stats.min_age || 0,
        maxAge: stats.max_age || 0,
        checkedInCount: stats.checked_in_count || 0,
        topOrganizations: orgBreakdown,
        tierBreakdown,
      },
    });
  } catch (error: any) {
    console.error('Admin Users API GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch registered attendees.' },
      { status: 500 }
    );
  }
}

// DELETE attendee by ID (Admin Only)
export async function DELETE(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to delete records.' },
        { status: 401 }
      );
    }

    await ensureTableExists();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid attendee ID is required.' }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM registrations WHERE id = ${parseInt(id, 10)}
      RETURNING id, name, email;
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'Attendee record not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Attendee "${deleted[0].name}" (${deleted[0].email}) successfully removed from database.`,
      id: deleted[0].id,
    });
  } catch (error: any) {
    console.error('Admin Users API DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete attendee record.' },
      { status: 500 }
    );
  }
}

// PATCH update attendee details (Admin Only)
export async function PATCH(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin privileges required to modify records.' },
        { status: 401 }
      );
    }

    await ensureTableExists();

    const body = await request.json();
    const { id, name, email, phone, age, organization, role, notes, ticket_type, checked_in } = body;

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid attendee ID is required.' }, { status: 400 });
    }

    const parsedAge = age !== undefined && age !== null ? parseInt(age, 10) : undefined;
    const isCheckedIn = typeof checked_in === 'boolean' ? checked_in : undefined;

    const updated = await sql`
      UPDATE registrations
      SET 
        name = COALESCE(${name?.trim()}, name),
        email = COALESCE(${email ? email.trim().toLowerCase() : undefined}, email),
        phone = COALESCE(${phone?.trim()}, phone),
        age = COALESCE(${parsedAge}, age),
        organization = COALESCE(${organization?.trim()}, organization),
        role = COALESCE(${role?.trim()}, role),
        notes = COALESCE(${notes?.trim()}, notes),
        ticket_type = COALESCE(${ticket_type?.trim()}, ticket_type),
        checked_in = COALESCE(${isCheckedIn}, checked_in)
      WHERE id = ${parseInt(id, 10)}
      RETURNING id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at;
    `;

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Attendee record not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: `Attendee "${updated[0].name}" updated successfully.`,
      user: updated[0],
    });
  } catch (error: any) {
    console.error('Admin Users API PATCH error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to update attendee record.' },
      { status: 500 }
    );
  }
}
