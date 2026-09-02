import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { 
      order_id, 
      payment_id, 
      signature, 
      formData 
    } = body;

    if (!formData) {
      return NextResponse.json({ error: 'Registration attendee details are required.' }, { status: 400 });
    }

    const { name, email, phone, age, organization, role, notes, selectedTier, currency = 'INR', amount } = formData;

    if (!payment_id) {
      return NextResponse.json({ error: 'Payment transaction reference ID is missing.' }, { status: 400 });
    }

    await ensureTableExists();

    // Check if email already registered
    const existing = await sql`
      SELECT id FROM registrations WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'An attendee is already registered with this email address.' },
        { status: 409 }
      );
    }

    const parsedAge = parseInt(age, 10) || 25;
    const tier = selectedTier || 'General Access';
    const cleanAmount = amount ? amount.toString() : '0';

    // Verify secret signature if secret key exists
    const razorpaySecret = process.env.RAZORPAY_KEY_SECRET;
    if (razorpaySecret && order_id && signature) {
      const generatedSignature = crypto
        .createHmac('sha256', razorpaySecret)
        .update(`${order_id}|${payment_id}`)
        .digest('hex');

      if (generatedSignature !== signature) {
        return NextResponse.json(
          { error: 'Payment signature verification failed. Transaction unauthorized.' },
          { status: 400 }
        );
      }
    }

    // Insert verified attendee into database
    const inserted = await sql`
      INSERT INTO registrations (
        name, email, phone, age, organization, role, notes, 
        ticket_type, checked_in, payment_id, order_id, payment_status, amount_paid, currency
      )
      VALUES (
        ${name.trim()},
        ${email.trim().toLowerCase()},
        ${phone.trim()},
        ${parsedAge},
        ${organization ? organization.trim() : null},
        ${role ? role.trim() : null},
        ${notes ? notes.trim() : null},
        ${tier},
        FALSE,
        ${payment_id},
        ${order_id || `ORD-${Date.now()}`},
        'PAID',
        ${cleanAmount},
        ${currency.toUpperCase()}
      )
      RETURNING id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, payment_id, order_id, payment_status, amount_paid, currency, created_at;
    `;

    return NextResponse.json({
      success: true,
      message: '🎉 Payment successfully verified! Attendee pass confirmed.',
      user: inserted[0],
    });
  } catch (error: any) {
    console.error('Verify Payment API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to verify payment and complete registration.' },
      { status: 500 }
    );
  }
}
