import { NextResponse } from 'next/server';
import { sql, ensureTableExists } from '@/lib/db';
import crypto from 'crypto';

// Tier pricing configuration
export const TIER_PRICING: Record<string, { priceUsd: number; priceInr: number; name: string }> = {
  'General Access': { priceUsd: 49, priceInr: 1999, name: 'General Access (STANDARD)' },
  'VIP All-Access': { priceUsd: 149, priceInr: 5999, name: 'VIP All-Access (EXCLUSIVE)' },
  'Speaker / Presenter': { priceUsd: 0, priceInr: 0, name: 'Speaker / Presenter (STAGE PASS)' },
  'Student / Innovator': { priceUsd: 19, priceInr: 799, name: 'Student / Innovator (ACADEMIC)' },
};

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, phone, age, organization, role, notes, selectedTier, currency = 'INR' } = body;

    // Validate inputs
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

    const tierKey = selectedTier?.trim() || 'General Access';
    const tierInfo = TIER_PRICING[tierKey] || TIER_PRICING['General Access'];

    await ensureTableExists();

    // Check if email is already registered
    const existing = await sql`
      SELECT id FROM registrations WHERE LOWER(email) = LOWER(${email.trim()}) LIMIT 1;
    `;

    if (existing.length > 0) {
      return NextResponse.json(
        { error: 'This email address is already registered. Please check "My Pass" to view your badge.' },
        { status: 409 }
      );
    }

    const isUsd = currency.toUpperCase() === 'USD';
    const priceAmount = isUsd ? tierInfo.priceUsd : tierInfo.priceInr;
    const selectedCurrency = isUsd ? 'USD' : 'INR';

    // FREE TIER: Bypass payment, trigger instant registration
    if (priceAmount === 0 || tierKey === 'Speaker / Presenter') {
      const freeOrderId = `FREE-${Date.now().toString(36).toUpperCase()}-${Math.floor(Math.random() * 900 + 100)}`;
      const freePaymentId = `COMPLIMENTARY-PASS-${Date.now().toString(36).toUpperCase()}`;

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
          ${tierKey},
          FALSE,
          ${freePaymentId},
          ${freeOrderId},
          'FREE',
          '0',
          ${selectedCurrency}
        )
        RETURNING id, name, email, phone, age, organization, role, notes, ticket_type, checked_in, payment_id, order_id, payment_status, amount_paid, currency, created_at;
      `;

      return NextResponse.json({
        status: 'CONFIRMED',
        message: 'Speaker registration confirmed with complimentary pass!',
        user: inserted[0],
      });
    }

    // PAID TIER: Create order
    const orderTimestamp = Date.now();
    const orderId = `order_${orderTimestamp}_${crypto.randomBytes(4).toString('hex')}`;
    const amountInSubunits = isUsd ? priceAmount * 100 : priceAmount * 100; // in cents or paise

    // Return payment order payload
    const razorpayKeyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID || 'rzp_test_registerhub_demo';

    return NextResponse.json({
      status: 'PAYMENT_REQUIRED',
      orderId,
      amount: priceAmount,
      amountInSubunits,
      currency: selectedCurrency,
      keyId: razorpayKeyId,
      tier: tierKey,
      tierName: tierInfo.name,
      customer: {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
      },
    });
  } catch (error: any) {
    console.error('Create Order API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Failed to initialize registration order.' },
      { status: 500 }
    );
  }
}
