import { NextRequest, NextResponse } from 'next/server';
import { sql, ensureAllTablesExist } from '@/lib/db';
import { checkAdminAuth } from '@/lib/admin-auth';

export async function GET(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();

    const logs = await sql`
      SELECT id, action, details, badge, event_id, created_at
      FROM audit_logs
      ORDER BY created_at DESC
      LIMIT 100;
    `;

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching audit logs:', error);
    return NextResponse.json({ error: error?.message || 'Failed to fetch audit logs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const body = await request.json();
    const { action, details, badge, event_id } = body;

    const inserted = await sql`
      INSERT INTO audit_logs (action, details, badge, event_id)
      VALUES (
        ${action || 'ACTION'},
        ${details || ''},
        ${badge || 'SYSTEM'},
        ${event_id || null}
      )
      RETURNING *;
    `;

    return NextResponse.json({ success: true, log: inserted[0] });
  } catch (error: any) {
    console.error('Error creating audit log:', error);
    return NextResponse.json({ error: error?.message || 'Failed to log action' }, { status: 500 });
  }
}
