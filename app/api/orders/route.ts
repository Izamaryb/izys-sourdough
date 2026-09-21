import { NextResponse } from 'next/server';
import { OrderStatus } from '@prisma/client';
import { logError } from '@/lib/logger';
import {
  createOrder,
  getOrders,
  PaymentMethodNotAcceptedError,
  PreorderCutoffPassedError,
  VacationModeActiveError,
  type CreateOrderInput,
} from '@/lib/orders';
import { PickupSlotDisabledError, PickupSlotFullError } from '@/lib/pickupSlots';
import type { PaymentMethod } from '@/types/checkout';

export const dynamic = 'force-dynamic';

const validPaymentMethods: PaymentMethod[] = ['venmo', 'cash-app', 'cash'];

function isValidPaymentMethod(value: unknown): value is PaymentMethod {
  return typeof value === 'string' && validPaymentMethods.includes(value as PaymentMethod);
}

function isValidOrderItem(item: unknown): item is { productId: string; quantity: number } {
  return (
    typeof item === 'object' &&
    item !== null &&
    'productId' in item &&
    typeof (item as { productId: unknown }).productId === 'string' &&
    'quantity' in item &&
    typeof (item as { quantity: unknown }).quantity === 'number' &&
    Number.isInteger((item as { quantity: number }).quantity) &&
    (item as { quantity: number }).quantity > 0
  );
}

function isValidCustomer(value: unknown): value is CreateOrderInput['customer'] {
  return (
    typeof value === 'object' &&
    value !== null &&
    'firstName' in value &&
    typeof (value as { firstName: unknown }).firstName === 'string' &&
    (value as { firstName: string }).firstName.trim().length > 0 &&
    'lastName' in value &&
    typeof (value as { lastName: unknown }).lastName === 'string' &&
    (value as { lastName: string }).lastName.trim().length > 0 &&
    'email' in value &&
    typeof (value as { email: unknown }).email === 'string' &&
    (value as { email: string }).email.trim().length > 0 &&
    'phone' in value &&
    typeof (value as { phone: unknown }).phone === 'string' &&
    (value as { phone: string }).phone.replace(/\D/g, '').length > 0
  );
}

function validateRequestBody(body: unknown): { input: CreateOrderInput } | { error: string } {
  if (typeof body !== 'object' || body === null) {
    return { error: 'Invalid request body.' };
  }

  const request = body as {
    customer?: unknown;
    items?: unknown;
    pickupDate?: unknown;
    pickupTime?: unknown;
    paymentMethod?: unknown;
  };

  if (!isValidCustomer(request.customer)) {
    return { error: 'Customer first name, last name, email, and phone are required.' };
  }

  if (!Array.isArray(request.items) || request.items.length === 0) {
    return { error: 'Order must contain at least one item.' };
  }

  if (!request.items.every(isValidOrderItem)) {
    return { error: 'Each order item must have a valid productId and positive quantity.' };
  }

  if (typeof request.pickupDate !== 'string' || request.pickupDate.trim().length === 0) {
    return { error: 'Pickup date is required.' };
  }

  if (typeof request.pickupTime !== 'string' || request.pickupTime.trim().length === 0) {
    return { error: 'Pickup time is required.' };
  }

  if (!isValidPaymentMethod(request.paymentMethod)) {
    return { error: 'Valid payment method is required.' };
  }

  return {
    input: {
      customer: {
        firstName: request.customer.firstName.trim(),
        lastName: request.customer.lastName.trim(),
        email: request.customer.email.trim(),
        phone: request.customer.phone.replace(/\D/g, ''),
        marketingOptIn: Boolean(request.customer.marketingOptIn),
        smsOptIn: Boolean(request.customer.smsOptIn),
        ...(typeof request.customer.password === 'string' && request.customer.password.trim()
          ? { password: request.customer.password.trim() }
          : {}),
      },
      items: request.items.map((item) => ({
        productId: item.productId.trim(),
        quantity: item.quantity,
      })),
      pickupDate: request.pickupDate.trim(),
      pickupTime: request.pickupTime.trim(),
      paymentMethod: request.paymentMethod,
    },
  };
}

const VALID_STATUSES = new Set<string>(Object.values(OrderStatus));

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const pickupDate = searchParams.get('pickupDate')?.trim();
    const status = searchParams.get('status')?.trim();

    const orders = await getOrders({
      ...(pickupDate ? { pickupDate } : {}),
      ...(status && VALID_STATUSES.has(status) ? { status: status as OrderStatus } : {}),
    });

    return NextResponse.json({ orders });
  } catch (error) {
    logError('Failed to fetch orders:', error);

    return NextResponse.json(
      { error: 'Failed to load orders. Please try again later.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const validation = validateRequestBody(body);

    if ('error' in validation) {
      return NextResponse.json({ error: validation.error }, { status: 400 });
    }

    const order = await createOrder(validation.input);

    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    logError('Failed to create order:', error);

    if (error instanceof PreorderCutoffPassedError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    if (error instanceof VacationModeActiveError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof PaymentMethodNotAcceptedError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    if (error instanceof PickupSlotFullError || error instanceof PickupSlotDisabledError) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : 'Failed to place order.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
