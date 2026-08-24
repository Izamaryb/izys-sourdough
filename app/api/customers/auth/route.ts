import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { verifyCustomerCredentials } from '@/lib/customers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!body?.email?.trim() || !body?.password) {
      return NextResponse.json(
        { error: 'Email and password are required.' },
        { status: 400 },
      );
    }

    const customer = await verifyCustomerCredentials(body.email, body.password);

    if (!customer) {
      return NextResponse.json(
        { error: 'Invalid email or password.' },
        { status: 401 },
      );
    }

    return NextResponse.json({ customer });
  } catch (error) {
    logError('Failed to authenticate customer:', error);

    return NextResponse.json(
      { error: 'Failed to sign in. Please try again later.' },
      { status: 500 },
    );
  }
}
