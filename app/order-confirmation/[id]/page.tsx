import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, ScrollToTop, Text } from '@/components/ui';
import { getOrderById } from '@/lib/orders';

const paymentLabels: Record<string, string> = {
  venmo: 'Venmo',
  'cash-app': 'Cash App',
  cash: 'Cash at Pickup',
};

const heroClasses = 'mx-auto flex max-w-3xl flex-col items-center gap-4 text-center';
const cardClasses =
  'mx-auto max-w-2xl cursor-default rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const detailGridClasses = 'mt-5 grid gap-3 sm:grid-cols-3';
const detailBoxClasses = 'px-1 py-2 text-left';
const labelClasses =
  'font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';
const valueClasses = 'mt-1 font-body text-body font-medium text-primary';
const itemRowClasses = 'flex items-center justify-between gap-4 py-2';
const actionClasses = 'mt-6 grid gap-3 sm:grid-cols-2';

type OrderConfirmationPageProps = {
  params: { id: string };
};

export default async function OrderConfirmationPage({ params }: OrderConfirmationPageProps) {
  const order = await getOrderById(params.id);

  if (!order) {
    notFound();
  }

  return (
    <PageContainer>
      <ScrollToTop />
      <SectionContainer spacing="lg" aria-labelledby="confirmation-heading">
        <div className={heroClasses}>
          <p className="font-body text-small font-medium uppercase tracking-[0.2em] text-secondary">
            Order received
          </p>
          <Heading id="confirmation-heading" level={1}>
            Thank You
          </Heading>
          <Text className="text-primary/90">
            Thank you for supporting Izy&apos;s Sourdough. Your order has been received.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm">
        <section className={cardClasses} aria-labelledby="order-details-heading">
          <Heading id="order-details-heading" level={2}>
            Confirmation Details
          </Heading>

          <div className={detailGridClasses}>
            <div className={detailBoxClasses}>
              <p className={labelClasses}>Pickup Date</p>
              <p className={valueClasses}>{order.pickupDate}</p>
            </div>
            <div className={detailBoxClasses}>
              <p className={labelClasses}>Pickup Time</p>
              <p className={valueClasses}>{order.pickupTime}</p>
            </div>
            <div className={detailBoxClasses}>
              <p className={labelClasses}>Payment</p>
              <p className={valueClasses}>{paymentLabels[order.paymentMethod] ?? order.paymentMethod}</p>
            </div>
          </div>

          <div className={`${detailBoxClasses} mt-5`}>
            <p className={labelClasses}>Pickup Location</p>
            <p className={valueClasses}>7191 Boxer Round Pl, Zephyrhills, FL 33541</p>
          </div>

          <div className="mt-6 border-t border-surfaceBorder pt-4">
            <p className={labelClasses}>Order Summary</p>
            <ul className="mt-3 divide-y divide-surfaceBorder">
              {order.items.map((item) => (
                <li key={item.name} className={itemRowClasses}>
                  <span className="font-body text-small text-primary">
                    {item.name} x {item.quantity}
                  </span>
                  <span className="font-body text-small font-medium text-primary">
                    ${item.lineTotal.toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>
            <div className={`${itemRowClasses} mt-2 border-t border-surfaceBorder pt-3`}>
              <span className="font-body text-body font-medium text-primary">Subtotal</span>
              <span className="font-body text-body font-medium text-primary">
                ${order.subtotal.toFixed(2)}
              </span>
            </div>
          </div>

          <div className={actionClasses}>
            <Link href="/">
              <Button fullWidth>Return Home</Button>
            </Link>
            <Link href="/menu">
              <Button fullWidth variant="secondary">
                View Menu
              </Button>
            </Link>
          </div>
        </section>
      </SectionContainer>
    </PageContainer>
  );
}
