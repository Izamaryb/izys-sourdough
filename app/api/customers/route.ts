import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { upsertCustomer } from '@/lib/customers';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      !body?.email?.trim() ||
      !body?.firstName?.trim() ||
      !body?.lastName?.trim() ||
      !body?.phone?.replace(/\D/g, '')
    ) {
      return NextResponse.json(
        { error: 'First name, last name, email, and phone are required.' },
        { status: 400 },
      );
    }

    const customer = await upsertCustomer({
      email: body.email,
      firstName: body.firstName,
      lastName: body.lastName,
      phone: body.phone,
      marketingOptIn: Boolean(body.marketingOptIn),
      smsOptIn: Boolean(body.smsOptIn),
      paymentMethod: body.paymentMethod || null,
      password: typeof body.password === 'string' ? body.password : null,
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    logError('Failed to save customer:', error);

    return NextResponse.json(
      { error: 'Failed to save customer. Please try again later.' },
      { status: 500 },
    );
  }
}
