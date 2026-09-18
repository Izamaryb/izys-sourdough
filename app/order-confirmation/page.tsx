'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, ScrollToTop, Text } from '@/components/ui';
import type { PaymentMethod, PreparedOrder } from '@/types/checkout';

const CONFIRMATION_STORAGE_KEY = 'izys-sourdough-last-order';

const paymentLabels: Record<PaymentMethod, string> = {
  venmo: 'Venmo',
  'cash-app': 'Cash App',
  cash: 'Cash at Pickup',
};

const heroClasses = 'mx-auto flex max-w-3xl flex-col items-center gap-4 text-center';
const cardClasses = 'mx-auto max-w-2xl cursor-default rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const detailGridClasses = 'mt-5 grid gap-3 sm:grid-cols-3';
const detailBoxClasses = 'px-1 py-2 text-left';
const labelClasses = 'font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';
const valueClasses = 'mt-1 font-body text-body font-medium text-primary';
const actionClasses = 'mt-6 grid gap-3 sm:grid-cols-2';

export default function OrderConfirmationPage() {
  const [order, setOrder] = useState<PreparedOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedOrder = window.sessionStorage.getItem(CONFIRMATION_STORAGE_KEY);

    if (storedOrder) {
      try {
        setOrder(JSON.parse(storedOrder));
      } catch {
        setOrder(null);
      }
    }

    setIsLoading(false);
  }, []);

  return (
    <PageContainer>
      <ScrollToTop />
      <SectionContainer spacing="lg" aria-labelledby="confirmation-heading">
        <div className={heroClasses}>
          <p className="font-body text-small font-medium uppercase tracking-[0.2em] text-secondary">Order received</p>
          <Heading id="confirmation-heading" level={1}>
            Thank You
          </Heading>
          <Text className="text-primary/90">
            Thank you for supporting Izy&apos;s Sourdough. Your order has been recieved.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm">
        <section className={cardClasses} aria-labelledby="order-details-heading">
          <Heading id="order-details-heading" level={2}>
            Confirmation Details
          </Heading>
          {isLoading ? (
            <div className="flex flex-col items-center gap-4 py-12">
              <div
                className="h-10 w-10 animate-spin rounded-full border-4 border-surfaceBorder border-t-button"
                aria-hidden="true"
              />
              <Text className="text-primary/70">Loading your order details...</Text>
            </div>
          ) : order ? (
            <>
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
                  <p className={valueClasses}>{paymentLabels[order.paymentMethod]}</p>
                </div>
              </div>
              <div className={`${detailBoxClasses} mt-5`}>
                <p className={labelClasses}>Pickup Location</p>
                <p className={valueClasses}>7191 Boxer Round Pl, Zephyrhills, FL 33541</p>
              </div>
            </>
          ) : (
            <Text className="mt-4 text-primary/90">
              We could not find recent order details on this device. If you just placed an order, please contact Izy&apos;s Sourdough for confirmation.
            </Text>
          )}
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
