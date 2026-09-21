import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getAcceptedPaymentMethods } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const paymentMethods = await getAcceptedPaymentMethods();

    return NextResponse.json({ paymentMethods });
  } catch (error) {
    logError('Failed to fetch accepted payment methods:', error);

    return NextResponse.json(
      { error: 'Failed to load payment methods. Please try again later.' },
      { status: 500 },
    );
  }
}
