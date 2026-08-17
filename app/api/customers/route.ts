import { NextResponse } from 'next/server';
import { getCustomerByEmail, upsertCustomer } from '@/lib/customers';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');

    if (!email || !email.trim()) {
      return NextResponse.json({ error: 'Email is required.' }, { status: 400 });
    }

    const customer = await getCustomerByEmail(email);

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found.' }, { status: 404 });
    }

    return NextResponse.json({ customer });
  } catch (error) {
    console.error('Failed to fetch customer:', error);

    return NextResponse.json(
      { error: 'Failed to load customer. Please try again later.' },
      { status: 500 },
    );
  }
}

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
    });

    return NextResponse.json({ customer }, { status: 201 });
  } catch (error) {
    console.error('Failed to save customer:', error);

    return NextResponse.json(
      { error: 'Failed to save customer. Please try again later.' },
      { status: 500 },
    );
  }
}
