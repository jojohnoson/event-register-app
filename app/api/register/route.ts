import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, organization, role, notes, ticket_type } = body;

    // Validation
    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return NextResponse.json({ error: 'Full name is required.' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return NextResponse.json({ error: 'A valid email address is required.' }, { status: 400 });
    }

    if (!phone || typeof phone !== 'string' || phone.trim().length < 6) {
      return NextResponse.json({ error: 'A valid phone number is required.' }, { status: 400 });
    }

    const parsedAge = parseInt(age, 10);
    if (isNaN(parsedAge) || parsedAge < 1 || parsedAge > 120) {
      return NextResponse.json({ error: 'Please provide a valid age between 1 and 120.' }, { status: 400 });
    }

    await ensureTableExists();

    // Check if email is already registered
    const existing = await sql`
      SELECT id FROM registrations WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'This email address is already registered.' },
        { status: 409 }
      );
    }

    const assignedTicketType = ticket_type?.trim() || 'General Access';

    // Insert user into database
    const inserted = await sql`
      INSERT INTO registrations (name, email, phone, age, organization, role, notes, ticket_type, checked_in)
      VALUES (
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone.trim()},
        ${parsedAge},
        ${organization ? organization.trim() : null},
        ${role ? role.trim() : null},
        ${notes ? notes.trim() : null},
        ${assignedTicketType},
        FALSE
      )
      RETURNING id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, created_at;
    `;

    return NextResponse.json(
      {
        message: 'Registration successful!',
        user: inserted[0],
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Registration API error:', error);
    // Handle unique constraint error fallback
    if (error?.code === '23505') {
      return NextResponse.json(
        { error: 'This email address is already registered.' },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: error?.message || 'Failed to complete registration. Please try again.' },
      { status: 500 }
    );
  }
}
