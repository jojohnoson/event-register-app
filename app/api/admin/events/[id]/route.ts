import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAuth } from '@/lib/admin-auth';
import { ensureAllTablesExist, sql } from '@/lib/db';

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const { id } = await params;
    const body = await request.json();

    const {
      title,
      slug,
      description,
      media_url,
      media_type,
      start_date,
      end_date,
      registration_deadline,
      max_capacity,
      status,
      form_fields,
      sessions
    } = body;

    const formFieldsJson = JSON.stringify(form_fields || {});
    const sessionsJson = JSON.stringify(sessions || []);

    const updated = await sql`
      UPDATE events SET
        title = ${title},
        slug = ${slug},
        description = ${description || ''},
        media_url = ${media_url || ''},
        media_type = ${media_type || 'video'},
        start_date = ${start_date},
        end_date = ${end_date},
        registration_deadline = ${registration_deadline || null},
        max_capacity = ${parseInt(max_capacity || 0, 10)},
        status = ${status || 'draft'},
        form_fields = ${formFieldsJson},
        sessions = ${sessionsJson}
      WHERE id = ${parseInt(id, 10)}
      RETURNING *;
    `;

    if (!updated || updated.length === 0) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    return NextResponse.json({ event: updated[0] });
  } catch (error: any) {
    console.error('Error updating event:', error);
    return NextResponse.json({ error: error.message || 'Failed to update event' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!checkAdminAuth(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await ensureAllTablesExist();
    const { id } = await params;

    await sql`
      DELETE FROM events WHERE id = ${parseInt(id, 10)};
    `;

    return NextResponse.json({ success: true, message: 'Event permanently deleted' });
  } catch (error: any) {
    console.error('Error deleting event:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete event' }, { status: 500 });
  }
}
