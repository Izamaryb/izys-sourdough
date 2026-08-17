import { NextResponse } from 'next/server';
import { OrderStatus, PaymentStatus } from '@prisma/client';
import {
  getOrderById,
  InvalidOrderStatusTransitionError,
  updateOrderStatus,
  updatePaymentStatus,
  InvalidPaymentStatusError,
} from '@/lib/orders';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ id: string }>;
};

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));
const VALID_PAYMENT_STATUSES = new Set<string>(Object.values(PaymentStatus));

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const order = await getOrderById(id);

    if (!order) {
      return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
    }

    return NextResponse.json({ order });
  } catch (error) {
    console.error('Failed to fetch order:', error);

    return NextResponse.json(
      { error: 'Failed to load order. Please try again later.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = await request.json();
    const status = body?.status;
    const paymentStatus = body?.paymentStatus;

    if (typeof status === 'string' && VALID_STATUSES.has(status)) {
      const order = await updateOrderStatus(id, status as OrderStatus);
      return NextResponse.json({ order });
    }

    if (typeof paymentStatus === 'string' && VALID_PAYMENT_STATUSES.has(paymentStatus)) {
      const order = await updatePaymentStatus(id, paymentStatus as PaymentStatus);
      return NextResponse.json({ order });
    }

    return NextResponse.json(
      { error: 'A valid order status or payment status is required.' },
      { status: 400 },
    );
  } catch (error) {
    if (error instanceof InvalidOrderStatusTransitionError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof InvalidPaymentStatusError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof Error && error.message.includes('Order not found')) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }

    console.error('Failed to update order:', error);

    return NextResponse.json(
      { error: 'Failed to update order. Please try again later.' },
      { status: 500 },
    );
  }
}
