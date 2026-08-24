import { NextRequest, NextResponse } from 'next/server';
import { ADMIN_COOKIE_NAME, SESSION_DURATION_SECONDS, createSessionToken } from '@/lib/adminSession';

export const runtime = 'edge';

export async function POST(request: NextRequest) {
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json(
      { error: 'Admin login is not configured. Set ADMIN_PASSWORD.' },
      { status: 500 },
    );
  }

  const body = await request.json().catch(() => null);
  const password = typeof body?.password === 'string' ? body.password : '';

  if (!password || password !== adminPassword) {
    return NextResponse.json({ error: 'Incorrect password.' }, { status: 401 });
  }

  const token = await createSessionToken();
  const response = NextResponse.json({ success: true });

  response.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: SESSION_DURATION_SECONDS,
  });

  return response;
}
