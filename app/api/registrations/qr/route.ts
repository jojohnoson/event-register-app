import { NextRequest, NextResponse } from 'next/server';
import QRCode from 'qrcode';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const attendeeId = searchParams.get('attendee_id');

    if (!attendeeId) {
      return NextResponse.json({ error: 'attendee_id is required' }, { status: 400 });
    }

    // High quality QR code with amber accent styling
    const qrDataUrl = await QRCode.toDataURL(attendeeId, {
      width: 280,
      margin: 2,
      color: {
        dark: '#f59e0b',
        light: '#080a0f',
      },
    });

    return NextResponse.json({ qrDataUrl });
  } catch (error: any) {
    console.error('Error generating QR code:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
