import { InventoryStatus, OrderStatus, PaymentMethodType, PaymentStatus } from '@prisma/client';
import { prisma } from './prisma';
import { hashPassword } from './passwords';
import { releasePickupSlot, reservePickupSlot } from './pickupSlots';
import { sendOrderConfirmation, sendOrderStatusUpdate } from './notifications';
import {
  findOpenBakeSessionForPickupDate,
  releaseBakeSessionCapacity,
  reserveBakeSessionCapacity,
} from './bakeSessions';
import { getAcceptedPaymentMethods, isVacationModeActive } from './settings';
import type { PaymentMethod } from '@/types/checkout';

function toPrismaPaymentMethod(method: PaymentMethod): PaymentMethodType {
  if (method === 'cash-app') {
    return PaymentMethodType.cashApp;
  }

  return method === 'venmo' ? PaymentMethodType.venmo : PaymentMethodType.cash;
}

function fromPrismaPaymentMethod(method: PaymentMethodType): PaymentMethod {
  if (method === PaymentMethodType.cashApp) {
    return 'cash-app';
  }

  return method === PaymentMethodType.venmo ? 'venmo' : 'cash';
}

type PrismaTransaction = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export type OrderItemInput = {
  productId: string;
  quantity: number;
};

export type CreateOrderInput = {
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    marketingOptIn?: boolean;
    smsOptIn?: boolean;
    password?: string;
  };
  items: OrderItemInput[];
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
};

export type OrderConfirmation = {
  id: string;
  status: string;
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  paymentStatus: string;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  subtotal: number;
  items: Array<{
    name: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
  }>;
  createdAt: Date;
};

function mapInventoryStatusFromStock(stockQuantity: number): InventoryStatus {
  if (stockQuantity <= 0) {
    return 'soldOut';
  }

  if (stockQuantity <= 8) {
    return 'low';
  }

  return 'available';
}

function normalizePhone(phone: string): string {
  return phone.replace(/\D/g, '');
}

const PREORDER_CUTOFF_HOURS = 48;
const BAKERY_TIME_ZONE = 'America/New_York';

export class PreorderCutoffPassedError extends Error {
  constructor(pickupDate: string) {
    super(`The ${PREORDER_CUTOFF_HOURS}-hour preorder cutoff has passed for ${pickupDate}.`);
    this.name = 'PreorderCutoffPassedError';
  }
}

export class VacationModeActiveError extends Error {
  constructor(pickupDate: string) {
    super(`Preorders are closed for ${pickupDate} because the bakery is on vacation.`);
    this.name = 'VacationModeActiveError';
  }
}

export class PaymentMethodNotAcceptedError extends Error {
  constructor(paymentMethod: PaymentMethod) {
    super(`The payment method "${paymentMethod}" is not currently accepted.`);
    this.name = 'PaymentMethodNotAcceptedError';
  }
}

function getTimeZoneOffsetMinutes(date: Date, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);

  const values: Record<string, string> = {};
  for (const part of parts) {
    values[part.type] = part.value;
  }

  const localTime = Date.UTC(
    Number(values.year),
    Number(values.month) - 1,
    Number(values.day),
    Number(values.hour),
    Number(values.minute),
    Number(values.second),
  );

  return (date.getTime() - localTime) / 60000;
}

function getStartOfDayTimestampInTimeZone(dateString: string, timeZone: string): number | null {
  const match = dateString.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (!match) {
    return null;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const targetUtc = Date.UTC(year, month - 1, day, 0, 0, 0);
  const offsetMinutes = getTimeZoneOffsetMinutes(new Date(targetUtc), timeZone);
  return targetUtc + offsetMinutes * 60000;
}

export function isBeforePickupCutoff(pickupDate: string, now = new Date()): boolean {
  const startOfDay = getStartOfDayTimestampInTimeZone(pickupDate, BAKERY_TIME_ZONE);
  if (startOfDay === null) {
    return false;
  }

  const cutoffTime = startOfDay - PREORDER_CUTOFF_HOURS * 60 * 60 * 1000;
  return now.getTime() <= cutoffTime;
}

export async function createOrder(input: CreateOrderInput): Promise<OrderConfirmation> {
  const { customer, items, pickupDate, pickupTime, paymentMethod } = input;
  const normalizedEmail = customer.email.toLowerCase().trim();

  if (!isBeforePickupCutoff(pickupDate)) {
    throw new PreorderCutoffPassedError(pickupDate);
  }

  if (await isVacationModeActive(pickupDate)) {
    throw new VacationModeActiveError(pickupDate);
  }

  const acceptedPaymentMethods = await getAcceptedPaymentMethods();
  if (!acceptedPaymentMethods[paymentMethod]) {
    throw new PaymentMethodNotAcceptedError(paymentMethod);
  }

  const confirmation = await prisma.$transaction(async (tx: PrismaTransaction) => {
    const slugs = items.map((item) => item.productId);
    const products = await tx.product.findMany({
      where: { slug: { in: slugs }, isActive: true },
    });

    const productBySlug = new Map(products.map((product) => [product.slug, product]));

    const orderItemsData: Array<{
      productId: string;
      quantity: number;
      unitPriceCents: number;
      lineTotalCents: number;
    }> = [];

    for (const item of items) {
      const product = productBySlug.get(item.productId);

      if (!product) {
        throw new Error(`Product ${item.productId} is no longer available.`);
      }

      if (!product.isActive) {
        throw new Error(`Product ${product.name} is no longer available.`);
      }

      if (product.stockQuantity < item.quantity) {
        throw new Error(
          `Not enough inventory for ${product.name}. Only ${product.stockQuantity} left.`,
        );
      }

      orderItemsData.push({
        productId: product.id,
        quantity: item.quantity,
        unitPriceCents: product.priceCents,
        lineTotalCents: product.priceCents * item.quantity,
      });
    }

    const productionUnits = orderItemsData.reduce((sum, item) => sum + item.quantity, 0);

    const bakeSession = await findOpenBakeSessionForPickupDate(pickupDate, tx);

    if (!bakeSession) {
      throw new Error('Preorders are not open for the selected pickup date.');
    }

    await reservePickupSlot(pickupDate, pickupTime, tx);
    await reserveBakeSessionCapacity(bakeSession.id, productionUnits, tx);

    const passwordHash = customer.password?.trim()
      ? await hashPassword(customer.password.trim())
      : undefined;

    const dbCustomer = await tx.customer.upsert({
      where: { email: normalizedEmail },
      create: {
        email: normalizedEmail,
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        phone: normalizePhone(customer.phone),
        marketingOptIn: customer.marketingOptIn ?? false,
        smsOptIn: customer.smsOptIn ?? false,
        paymentMethod,
        passwordHash: passwordHash ?? null,
      },
      update: {
        firstName: customer.firstName.trim(),
        lastName: customer.lastName.trim(),
        phone: normalizePhone(customer.phone),
        marketingOptIn: customer.marketingOptIn ?? false,
        smsOptIn: customer.smsOptIn ?? false,
        paymentMethod,
        ...(passwordHash ? { passwordHash } : {}),
      },
    });

    const subtotalCents = orderItemsData.reduce((sum, item) => sum + item.lineTotalCents, 0);

    const subtotalCentsForPayment = subtotalCents;

    const order = await tx.order.create({
      data: {
        status: 'confirmed',
        customerId: dbCustomer.id,
        bakeSessionId: bakeSession.id,
        pickupDate,
        pickupTime,
        marketingOptIn: customer.marketingOptIn ?? false,
        subtotalCents,
        items: {
          create: orderItemsData,
        },
        payment: {
          create: {
            method: toPrismaPaymentMethod(paymentMethod),
            status: 'awaitingPayment',
            amountCents: subtotalCentsForPayment,
          },
        },
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        customer: true,
        payment: true,
      },
    });

    for (const item of items) {
      const product = productBySlug.get(item.productId);

      if (!product) {
        continue;
      }

      const newStock = product.stockQuantity - item.quantity;

      await tx.product.update({
        where: { id: product.id },
        data: {
          stockQuantity: newStock,
          inventoryStatus: mapInventoryStatusFromStock(newStock),
        },
      });
    }

    return {
      id: order.id,
      status: order.status,
      customerName: `${order.customer.firstName} ${order.customer.lastName}`,
      email: order.customer.email,
      phone: order.customer.phone,
      pickupDate: order.pickupDate,
      pickupTime: order.pickupTime,
      paymentMethod: fromPrismaPaymentMethod(order.payment!.method),
      paymentStatus: order.payment!.status,
      marketingOptIn: order.marketingOptIn,
      smsOptIn: dbCustomer.smsOptIn,
      subtotal: order.subtotalCents / 100,
      items: order.items.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        unitPrice: item.unitPriceCents / 100,
        lineTotal: item.lineTotalCents / 100,
      })),
      createdAt: order.createdAt,
    };
  });

  await sendOrderConfirmation(confirmation);

  return confirmation;
}

const ALLOWED_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  confirmed: [OrderStatus.readyForPickup, OrderStatus.cancelled],
  readyForPickup: [OrderStatus.pickedUp, OrderStatus.cancelled],
  pickedUp: [],
  cancelled: [],
};

export class InvalidOrderStatusTransitionError extends Error {
  constructor(from: OrderStatus, to: OrderStatus) {
    super(`Cannot change order status from "${from}" to "${to}".`);
    this.name = 'InvalidOrderStatusTransitionError';
  }
}

export async function updateOrderStatus(
  id: string,
  nextStatus: OrderStatus,
): Promise<OrderConfirmation> {
  const confirmation = await prisma.$transaction(async (tx: PrismaTransaction) => {
    const order = await tx.order.findUnique({
      where: { id },
      include: { items: true },
    });

    if (!order) {
      throw new Error('Order not found.');
    }

    if (order.status === nextStatus) {
      return order;
    }

    const allowedNextStatuses = ALLOWED_STATUS_TRANSITIONS[order.status];

    if (!allowedNextStatuses.includes(nextStatus)) {
      throw new InvalidOrderStatusTransitionError(order.status, nextStatus);
    }

    if (nextStatus === OrderStatus.cancelled) {
      await releasePickupSlot(order.pickupDate, order.pickupTime, tx);

      if (order.bakeSessionId) {
        const productionUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);
        await releaseBakeSessionCapacity(order.bakeSessionId, productionUnits, tx);
      }

      for (const item of order.items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });

        if (!product) {
          continue;
        }

        const newStock = product.stockQuantity + item.quantity;

        await tx.product.update({
          where: { id: product.id },
          data: {
            stockQuantity: newStock,
            inventoryStatus: mapInventoryStatusFromStock(newStock),
          },
        });
      }
    }

    return tx.order.update({
      where: { id },
      data: { status: nextStatus },
    });
  });

  const updatedOrder = await getOrderById(id);

  if (!updatedOrder) {
    throw new Error('Order not found after status update.');
  }

  if (confirmation.status !== nextStatus) {
    await sendOrderStatusUpdate(updatedOrder, confirmation.status);
  }

  return updatedOrder;
}

const VALID_PAYMENT_STATUSES = new Set<string>(Object.values(PaymentStatus));

export class InvalidPaymentStatusError extends Error {
  constructor(status: string) {
    super(`Invalid payment status "${status}".`);
    this.name = 'InvalidPaymentStatusError';
  }
}

export async function updatePaymentStatus(
  id: string,
  paymentStatus: PaymentStatus,
): Promise<OrderConfirmation> {
  if (!VALID_PAYMENT_STATUSES.has(paymentStatus)) {
    throw new InvalidPaymentStatusError(paymentStatus);
  }

  await prisma.payment.update({
    where: { orderId: id },
    data: { status: paymentStatus },
  });

  const order = await getOrderById(id);

  if (!order) {
    throw new Error('Order not found after payment update.');
  }

  return order;
}

function mapOrderToConfirmation(order: {
  id: string;
  status: OrderStatus;
  customer: { firstName: string; lastName: string; email: string; phone: string; smsOptIn: boolean };
  pickupDate: string;
  pickupTime: string;
  marketingOptIn: boolean;
  subtotalCents: number;
  createdAt: Date;
  payment?: { method: PaymentMethodType; status: PaymentStatus } | null;
  items: Array<{
    quantity: number;
    unitPriceCents: number;
    lineTotalCents: number;
    product: { name: string };
  }>;
}): OrderConfirmation {
  return {
    id: order.id,
    status: order.status,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`,
    email: order.customer.email,
    phone: order.customer.phone,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    paymentMethod: fromPrismaPaymentMethod(order.payment!.method),
    paymentStatus: order.payment!.status,
    marketingOptIn: order.marketingOptIn,
    smsOptIn: order.customer.smsOptIn,
    subtotal: order.subtotalCents / 100,
    items: order.items.map((item) => ({
      name: item.product.name,
      quantity: item.quantity,
      unitPrice: item.unitPriceCents / 100,
      lineTotal: item.lineTotalCents / 100,
    })),
    createdAt: order.createdAt,
  };
}

export async function getOrders(filters?: {
  pickupDate?: string;
  status?: OrderStatus;
}): Promise<OrderConfirmation[]> {
  const where: Record<string, unknown> = {};

  if (filters?.pickupDate) {
    where.pickupDate = filters.pickupDate;
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  const orders = await prisma.order.findMany({
    where,
    include: {
      items: { include: { product: true } },
      customer: true,
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  return orders.map(mapOrderToConfirmation);
}

export async function getOrderById(id: string): Promise<OrderConfirmation | null> {
  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: { include: { product: true } },
      customer: true,
      payment: true,
    },
  });

  if (!order) {
    return null;
  }

  return mapOrderToConfirmation(order);
}
