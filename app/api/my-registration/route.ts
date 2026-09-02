import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, phone, id } = body;

    if (!email && !phone && !id) {
      return NextResponse.json(
        { error: 'Please provide your registered email address, phone, or attendee ID.' },
        { status: 400 }
      );
    }

    await ensureTableExists();

    let userRecord = null;

    if (id && !isNaN(parseInt(id, 10))) {
      const result = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE id = ${parseInt(id, 10)}
        LIMIT 1;
      `;
      if (result.length > 0) userRecord = result[0];
    } else if (email && typeof email === 'string') {
      const cleanEmail = email.trim().toLowerCase();
      const result = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE LOWER(email) = ${cleanEmail}
        LIMIT 1;
      `;
      if (result.length > 0) userRecord = result[0];
    } else if (phone && typeof phone === 'string') {
      const cleanPhone = phone.trim();
      const result = await sql`
        SELECT id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at
        FROM registrations
        WHERE phone = ${cleanPhone}
        LIMIT 1;
      `;
      if (result.length > 0) userRecord = result[0];
    }

    if (!userRecord) {
      return NextResponse.json(
        { error: 'No registration record was found matching the provided details. Please check for typos or register below.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: userRecord,
      message: 'Registration record found!',
    });
  } catch (error: any) {
    console.error('My Registration lookup API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to lookup registration record.' },
      { status: 500 }
    );
  }
}
