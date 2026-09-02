import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

// Secure endpoint: if caller is admin, return users; otherwise return only public stats
export async function GET(request: Request) {
  try {
    await ensureTableExists();

    const isAdmin = checkAdminAuth(request);

    // Aggregate statistics
    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_count,
        COUNT(DISTINCT organization)::int as total_organizations,
        COALESCE(ROUND(AVG(age), 1)::float, 0) as average_age
      FROM registrations;
    `;

    const stats = statsResult[0] || {
      total_count: 0,
      total_organizations: 0,
      average_age: 0,
    };

    const formattedStats = {
      total: stats.total_count || 0,
      organizations: stats.total_organizations || 0,
      avgAge: stats.average_age || 0,
      storageEngine: {
        name: 'PostgreSQL',
        status: 'ACTIVE',
        details: 'PostgreSQL Serverless',
      },
    };

    // If caller is NOT an authorized admin, do NOT leak attendee personal records
    if (!isAdmin) {
      return NextResponse.json({
        users: [], // Keep empty for privacy protection
        stats: formattedStats,
        message: 'Attendee directory is protected. Log in as admin to view detailed records.',
      });
    }

    // Authorized admin: return full user list
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('q')?.trim();

    let users;
    if (query) {
      const searchPattern = `%${query}%`;
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, created_at
        FROM registrations
        WHERE 
          name ILIKE ${searchPattern} OR
          email ILIKE ${searchPattern} OR
          phone ILIKE ${searchPattern} OR
          organization ILIKE ${searchPattern} OR
          role ILIKE ${searchPattern}
        ORDER BY created_at DESC;
      `;
    } else {
      users = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, created_at
        FROM registrations
        ORDER BY created_at DESC;
      `;
    }

    return NextResponse.json({
      users,
      stats: formattedStats,
    });
  } catch (error: any) {
    console.error('Users API GET error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to fetch data.' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin authentication required to delete attendee accounts.' },
        { status: 401 }
      );
    }

    await ensureTableExists();

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id || isNaN(parseInt(id, 10))) {
      return NextResponse.json({ error: 'Valid user ID is required.' }, { status: 400 });
    }

    const deleted = await sql`
      DELETE FROM registrations WHERE id = ${parseInt(id, 10)}
      RETURNING id, name;
    `;

    if (deleted.length === 0) {
      return NextResponse.json({ error: 'User record not found.' }, { status: 404 });
    }

    return NextResponse.json({
      message: `User ${deleted[0].name} successfully removed.`,
      id: deleted[0].id,
    });
  } catch (error: any) {
    console.error('Users API DELETE error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to delete user.' },
      { status: 500 }
    );
  }
}
