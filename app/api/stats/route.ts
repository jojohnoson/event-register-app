import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';

export async function GET() {
  try {
    await ensureTableExists();

    const statsResult = await sql`
      SELECT 
        COUNT(*)::int as total_count,
        COUNT(DISTINCT organization)::int as total_organizations,
        COALESCE(ROUND(AVG(age), 1)::float, 0) as average_age,
        COUNT(CASE WHEN checked_in = TRUE THEN 1 END)::int as checked_in_count
      FROM registrations;
    `;

    const stats = statsResult[0] || {
      total_count: 0,
      total_organizations: 0,
      average_age: 0,
      checked_in_count: 0,
    };

    return NextResponse.json({
      stats: {
        total: stats.total_count || 0,
        organizations: stats.total_organizations || 0,
        avgAge: stats.average_age || 0,
        checkedInCount: stats.checked_in_count || 0,
        passStatus: {
          label: 'INSTANT PASS',
          status: 'ACTIVE',
          details: 'Verified 256-Bit Security',
        },
        storageEngine: {
          name: 'PostgreSQL',
          status: 'ACTIVE',
          details: 'PostgreSQL Serverless',
        },
      },
      updatedAt: new Date().toISOString(),
    });
  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        stats: {
          total: 0,
          organizations: 0,
          avgAge: 0,
          storageEngine: {
            name: 'PostgreSQL',
            status: 'CONNECTING',
            details: 'PostgreSQL Serverless',
          },
        },
        error: error?.message || 'Failed to fetch public stats',
      },
      { status: 200 } // Return fallback stats gracefully
    );
  }
}
