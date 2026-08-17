import { OrderStatus } from '@prisma/client';
import { getAdminDashboardSummary } from '@/lib/admin';
import { classNames } from '@/lib/classNames';

export const dynamic = 'force-dynamic';

function getTodayDateValue(): string {
  return new Date().toLocaleDateString('en-CA');
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}

function formatShortOrderId(id: string): string {
  return id.slice(-8).toUpperCase();
}

function humanizeStatus(status: OrderStatus): string {
  const labels: Record<OrderStatus, string> = {
    confirmed: 'Confirmed',
    readyForPickup: 'Ready for Pickup',
    pickedUp: 'Picked Up',
    cancelled: 'Cancelled',
  };

  return labels[status] ?? status;
}

function StatusBadge({ status }: { status: OrderStatus }) {
  const styles: Record<OrderStatus, string> = {
    confirmed: 'bg-button/10 text-button border-button/20',
    readyForPickup: 'bg-green-100 text-green-800 border-green-200',
    pickedUp: 'bg-accent/20 text-secondary border-accent/30',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <span
      className={classNames(
        'inline-flex items-center rounded-md border px-2.5 py-0.5 text-small font-medium',
        styles[status],
      )}
    >
      {humanizeStatus(status)}
    </span>
  );
}

function DashboardCard({
  title,
  children,
  className,
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={classNames(
        'rounded-lg border border-surfaceBorder bg-background-soft p-6 shadow-card',
        className,
      )}
    >
      <h2 className="mb-4 font-heading text-h3 font-bold text-primary">{title}</h2>
      {children}
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return <p className="text-small text-secondary">{message}</p>;
}

export default async function AdminDashboardPage() {
  const today = getTodayDateValue();
  const summary = await getAdminDashboardSummary(today);

  return (
    <div>
      <p className="mb-6 font-body text-small text-secondary">{today}</p>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <DashboardCard title="Customer Metrics" className="lg:col-span-1">
            <dl className="grid gap-4 sm:grid-cols-3">
              <div>
                <dt className="text-small text-secondary">Total</dt>
                <dd className="font-heading text-h2">{summary.customerMetrics.total}</dd>
              </div>
              <div>
                <dt className="text-small text-secondary">New today</dt>
                <dd className="font-heading text-h2">{summary.customerMetrics.newToday}</dd>
              </div>
              <div>
                <dt className="text-small text-secondary">Repeat</dt>
                <dd className="font-heading text-h2">{summary.customerMetrics.repeat}</dd>
              </div>
            </dl>
          </DashboardCard>

          <DashboardCard title="Production Summary" className="md:col-span-2 lg:col-span-2">
            {summary.production.items.length === 0 ? (
              <EmptyState message="No production totals for today." />
            ) : (
              <>
                <div className="mb-4 flex flex-wrap items-center gap-4">
                  <p className="font-heading text-h2">{summary.production.totalUnits} units</p>
                  {summary.production.bakeSession ? (
                    <p className="text-small text-secondary">
                      Capacity: {summary.production.bakeSession.reservedUnits} /{' '}
                      {summary.production.bakeSession.maxCapacity} reserved
                      <span className="ml-2 inline-block rounded-md bg-accent/20 px-2 py-0.5 text-secondary">
                        {summary.production.bakeSession.status}
                      </span>
                    </p>
                  ) : null}
                </div>
                <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                  {summary.production.items.map((item) => (
                    <li
                      key={item.productName}
                      className="flex items-center justify-between rounded-md border border-surfaceBorder bg-background px-4 py-2"
                    >
                      <span className="font-body text-body">{item.productName}</span>
                      <span className="font-heading text-h3">{item.totalUnits}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </DashboardCard>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <DashboardCard title="Today's Orders">
            {summary.orders.length === 0 ? (
              <EmptyState message="No orders for today yet." />
            ) : (
              <ul className="space-y-4">
                {summary.orders.map((order) => (
                  <li
                    key={order.id}
                    className="rounded-md border border-surfaceBorder bg-background p-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="font-body text-small font-medium text-secondary">
                          Order #{formatShortOrderId(order.id)}
                        </p>
                        <p className="font-body text-body text-primary">
                          {order.customerName}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>
                    <p className="mt-2 font-body text-small text-secondary">
                      {order.items.map((item) => `${item.quantity}× ${item.productName}`).join(', ')}
                    </p>
                    <div className="mt-2 flex flex-wrap items-center gap-4 text-small text-secondary">
                      <span>Pickup: {order.pickupTime}</span>
                      <span>{formatCurrency(order.subtotal)}</span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>

          <DashboardCard title="Pickup Schedule">
            {summary.pickupSchedule.length === 0 ? (
              <EmptyState message="No pickups scheduled for today." />
            ) : (
              <ul className="space-y-4">
                {summary.pickupSchedule.map((slot) => (
                  <li key={slot.time}>
                    <h3 className="mb-2 font-heading text-h3 font-bold text-primary">
                      {slot.time}
                    </h3>
                    <ul className="space-y-2">
                      {slot.orders.map((order) => (
                        <li
                          key={order.id}
                          className="flex items-center justify-between rounded-md border border-surfaceBorder bg-background px-4 py-2"
                        >
                          <div>
                            <p className="font-body text-body text-primary">
                              {order.customerName}
                            </p>
                            <p className="text-small text-secondary">
                              Order #{formatShortOrderId(order.id)}
                            </p>
                          </div>
                          <StatusBadge status={order.status} />
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            )}
          </DashboardCard>
        </div>

        <div className="mt-6">
          <DashboardCard title="Best Sellers">
            {summary.bestSellers.length === 0 ? (
              <EmptyState message="No sales data yet." />
            ) : (
              <ol className="space-y-2">
                {summary.bestSellers.map((item, index) => (
                  <li
                    key={item.productName}
                    className="flex items-center justify-between rounded-md border border-surfaceBorder bg-background px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-button/10 font-heading text-small font-bold text-button">
                        {index + 1}
                      </span>
                      <span className="font-body text-body text-primary">
                        {item.productName}
                      </span>
                    </div>
                    <span className="font-heading text-h3">{item.totalUnits}</span>
                  </li>
                ))}
              </ol>
            )}
          </DashboardCard>
        </div>
    </div>
  );
}
