'use client';

import { useCallback, useEffect, useState } from 'react';
import { Button, Heading, InputField, SelectField, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import { humanizeStatus, statusBadgeClasses, formatCurrency, formatShortOrderId } from '@/lib/admin';
import type { OrderStatus, PaymentStatus } from '@prisma/client';
import type { OrderConfirmation } from '@/lib/orders';

const orderStatuses: OrderStatus[] = ['confirmed', 'readyForPickup', 'pickedUp', 'cancelled'];
const paymentStatuses: PaymentStatus[] = ['notRequired', 'awaitingPayment', 'paid', 'refunded', 'failed'];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<OrderConfirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [pickupDateFilter, setPickupDateFilter] = useState<string>('');

  const loadOrders = useCallback(async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (pickupDateFilter) params.set('pickupDate', pickupDateFilter);

      const response = await fetch(`/api/orders?${params.toString()}`);

      if (!response.ok) {
        throw new Error('Failed to load orders.');
      }

      const data = (await response.json()) as { orders: OrderConfirmation[] };
      setOrders(data.orders);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }, [statusFilter, pickupDateFilter]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  async function updateOrderStatus(order: OrderConfirmation, status: OrderStatus) {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to update order status.');
      }

      const data = (await response.json()) as { order: OrderConfirmation };
      setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function updatePaymentStatus(order: OrderConfirmation, paymentStatus: PaymentStatus) {
    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to update payment status.');
      }

      const data = (await response.json()) as { order: OrderConfirmation };
      setOrders((prev) => prev.map((o) => (o.id === order.id ? data.order : o)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const statusOptions = [
    { value: '', label: 'All statuses' },
    ...orderStatuses.map((status) => ({ value: status, label: humanizeStatus(status) })),
  ];

  return (
    <div>
      <Heading level={2} className="mb-6">
        Orders
      </Heading>

      <div className="mb-6 grid gap-4 md:grid-cols-2">
        <SelectField
          label="Status"
          value={statusFilter}
          options={statusOptions}
          onChange={(value) => setStatusFilter(value)}
        />
        <InputField
          label="Pickup date"
          type="date"
          value={pickupDateFilter}
          onChange={(e) => setPickupDateFilter(e.target.value)}
        />
      </div>

      {error ? <p className="mb-4 text-small text-primary">{error}</p> : null}

      {isLoading ? (
        <Text muted>Loading orders…</Text>
      ) : (
        <div>
          {orders.map((order) => (
            <div key={order.id} className="border-b border-button py-6 last:border-b-0">
              <div className="flex flex-col gap-2 md:flex-row md:items-start md:justify-between">
                <div>
                  <Text className="font-medium">
                    Order #{formatShortOrderId(order.id)} · {order.customerName}
                  </Text>
                  <Text size="small" muted>
                    {order.email} · {order.phone}
                  </Text>
                  <Text size="small" muted>
                    Pickup {order.pickupDate} at {order.pickupTime} ·{' '}
                    {formatCurrency(order.subtotal)} · {order.paymentMethod}
                  </Text>
                  <p className="mt-1 text-small text-secondary">
                    {order.items.map((item) => `${item.quantity}× ${item.name}`).join(', ')}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <span
                    className={classNames(
                      'inline-flex items-center rounded-md border px-2.5 py-0.5 text-small font-medium',
                      statusBadgeClasses(order.status as OrderStatus),
                    )}
                  >
                    {humanizeStatus(order.status)}
                  </span>
                </div>
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <SelectField
                  label="Order status"
                  value={order.status}
                  options={statusOptions.filter((o) => o.value !== '')}
                  onChange={(value) => updateOrderStatus(order, value as OrderStatus)}
                />
                <SelectField
                  label="Payment status"
                  value={order.paymentStatus}
                  options={paymentStatuses.map((status) => ({ value: status, label: status }))}
                  onChange={(value) => updatePaymentStatus(order, value as PaymentStatus)}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
