import { NextResponse } from 'next/server';
import { getAllPublishedEvents, ensureAllTablesExist } from '@/lib/db';

export async function GET() {
  try {
    await ensureAllTablesExist();
    const events = await getAllPublishedEvents();
    return NextResponse.json({ events });
  } catch (error: any) {
    console.error('Error fetching published events:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch events' }, { status: 500 });
  }
}
