import { OrderStatus, PaymentStatus, type BakeSessionStatus } from '@prisma/client';
import { prisma } from './prisma';

export type AdminOrderListItem = {
  id: string;
  status: OrderStatus;
  customerName: string;
  email: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  subtotal: number;
  paymentStatus: PaymentStatus;
  items: Array<{
    productName: string;
    quantity: number;
  }>;
};

export type ProductionSummaryItem = {
  productName: string;
  totalUnits: number;
};

export type ProductionSummary = {
  items: ProductionSummaryItem[];
  totalUnits: number;
  bakeSession: {
    status: BakeSessionStatus | null;
    maxCapacity: number | null;
    reservedUnits: number;
  } | null;
};

export type PickupScheduleItem = {
  time: string;
  orders: AdminOrderListItem[];
};

export type CustomerMetrics = {
  newToday: number;
  repeat: number;
  total: number;
};

export type BestSeller = {
  productName: string;
  totalUnits: number;
};

export type AdminDashboardSummary = {
  date: string;
  orders: AdminOrderListItem[];
  production: ProductionSummary;
  pickupSchedule: PickupScheduleItem[];
  customerMetrics: CustomerMetrics;
  bestSellers: BestSeller[];
};

function formatOrderForAdmin(order: {
  id: string;
  status: OrderStatus;
  customer: { firstName: string; lastName: string; email: string; phone: string };
  pickupDate: string;
  pickupTime: string;
  subtotalCents: number;
  payment: { status: PaymentStatus } | null;
  items: Array<{ quantity: number; product: { name: string } }>;
}): AdminOrderListItem {
  return {
    id: order.id,
    status: order.status,
    customerName: `${order.customer.firstName} ${order.customer.lastName}`,
    email: order.customer.email,
    phone: order.customer.phone,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    subtotal: order.subtotalCents / 100,
    paymentStatus: order.payment?.status ?? PaymentStatus.awaitingPayment,
    items: order.items.map((item) => ({
      productName: item.product.name,
      quantity: item.quantity,
    })),
  };
}

export async function getAdminDashboardSummary(dateValue: string): Promise<AdminDashboardSummary> {
  const [orders, bakeSession, customerMetrics, bestSellers] = await Promise.all([
    getTodayOrders(dateValue),
    getProductionSummary(dateValue),
    getCustomerMetrics(),
    getBestSellers(),
  ]);

  const productionItems = bakeSession?.items ?? [];
  const productionTotal = productionItems.reduce((sum, item) => sum + item.totalUnits, 0);

  return {
    date: dateValue,
    orders,
    production: {
      items: productionItems,
      totalUnits: productionTotal,
      bakeSession: bakeSession?.session ?? null,
    },
    pickupSchedule: buildPickupSchedule(orders),
    customerMetrics,
    bestSellers,
  };
}

async function getTodayOrders(dateValue: string): Promise<AdminOrderListItem[]> {
  const orders = await prisma.order.findMany({
    where: {
      pickupDate: dateValue,
      status: { not: OrderStatus.cancelled },
    },
    include: {
      customer: true,
      items: {
        include: {
          product: true,
        },
      },
      payment: true,
    },
    orderBy: [
      { pickupTime: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  return orders.map(formatOrderForAdmin);
}

async function getProductionSummary(
  dateValue: string,
): Promise<{ session: ProductionSummary['bakeSession']; items: ProductionSummaryItem[] } | null> {
  const bakeSession = await prisma.bakeSession.findFirst({
    where: { pickupDate: dateValue },
    include: {
      orders: {
        where: { status: { not: OrderStatus.cancelled } },
        include: {
          items: {
            include: { product: true },
          },
        },
      },
    },
  });

  const totalsByProduct = new Map<string, number>();

  function addItems(
    items: Array<{ quantity: number; product: { name: string } }>,
  ) {
    for (const item of items) {
      totalsByProduct.set(item.product.name, (totalsByProduct.get(item.product.name) ?? 0) + item.quantity);
    }
  }

  if (bakeSession) {
    for (const order of bakeSession.orders) {
      addItems(order.items);
    }
  } else {
    const orders = await prisma.order.findMany({
      where: {
        pickupDate: dateValue,
        status: { not: OrderStatus.cancelled },
      },
      include: {
        items: {
          include: { product: true },
        },
      },
    });

    for (const order of orders) {
      addItems(order.items);
    }
  }

  const items = Array.from(totalsByProduct.entries())
    .map(([productName, totalUnits]) => ({ productName, totalUnits }))
    .sort((a, b) => b.totalUnits - a.totalUnits);

  return {
    session: bakeSession
      ? {
          status: bakeSession.status,
          maxCapacity: bakeSession.maxCapacity,
          reservedUnits: bakeSession.reservedUnits,
        }
      : null,
    items,
  };
}

function buildPickupSchedule(orders: AdminOrderListItem[]): PickupScheduleItem[] {
  const grouped = new Map<string, AdminOrderListItem[]>();

  for (const order of orders) {
    const list = grouped.get(order.pickupTime) ?? [];
    list.push(order);
    grouped.set(order.pickupTime, list);
  }

  return Array.from(grouped.entries())
    .sort(([timeA], [timeB]) => timeA.localeCompare(timeB))
    .map(([time, slotOrders]) => ({ time, orders: slotOrders }));
}

async function getCustomerMetrics(): Promise<CustomerMetrics> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [newToday, total, repeat] = await Promise.all([
    prisma.customer.count({
      where: { createdAt: { gte: today } },
    }),
    prisma.customer.count(),
    prisma.order.groupBy({
      by: ['customerId'],
      _count: { id: true },
      having: { customerId: { _count: { gte: 2 } } },
    }),
  ]);

  return {
    newToday,
    repeat: repeat.length,
    total,
  };
}

async function getBestSellers(): Promise<BestSeller[]> {
  const grouped = await prisma.orderItem.groupBy({
    by: ['productId'],
    _sum: { quantity: true },
    where: {
      order: { status: { not: OrderStatus.cancelled } },
    },
  });

  const productIds = grouped.map((group) => group.productId);

  if (productIds.length === 0) {
    return [];
  }

  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });

  const productNameById = new Map(products.map((product) => [product.id, product.name]));

  return grouped
    .map((group) => ({
      productName: productNameById.get(group.productId) ?? group.productId,
      totalUnits: group._sum.quantity ?? 0,
    }))
    .sort((a, b) => b.totalUnits - a.totalUnits);
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

export function formatShortOrderId(id: string): string {
  return id.slice(-8).toUpperCase();
}

export function humanizeStatus(status: OrderStatus | string): string {
  const labels: Record<string, string> = {
    confirmed: 'Confirmed',
    readyForPickup: 'Ready for Pickup',
    pickedUp: 'Picked Up',
    cancelled: 'Cancelled',
  };

  return labels[status] ?? status;
}

export function statusBadgeClasses(status: OrderStatus): string {
  const styles: Record<OrderStatus, string> = {
    confirmed: 'bg-button/10 text-button border-button/20',
    readyForPickup: 'bg-green-100 text-green-800 border-green-200',
    pickedUp: 'bg-accent/20 text-secondary border-accent/30',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return styles[status];
}
