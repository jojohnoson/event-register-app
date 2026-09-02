import { NextResponse } from 'next/server';
import { validateAdminPassword, generateAdminToken } from '@/lib/admin-auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { error: 'Admin password is required.' },
        { status: 400 }
      );
    }

    const isValid = validateAdminPassword(password);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Invalid admin credentials. Please enter the correct password.' },
        { status: 401 }
      );
    }

    const token = generateAdminToken();

    return NextResponse.json({
      success: true,
      message: 'Admin authorization successful!',
      token,
      role: 'admin',
      expiresIn: '7 days',
    });
  } catch (error: any) {
    console.error('Admin login API error:', error);
    return NextResponse.json(
      { error: error?.message || 'Authentication failed' },
      { status: 500 }
    );
  }
}
