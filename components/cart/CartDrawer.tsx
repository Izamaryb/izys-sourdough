'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useEffect } from 'react';
import { Button, Heading, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import { hasStoredAccountCustomer, hasStoredCheckoutCustomerInfo } from '@/lib/checkoutStorage';
import { useCart } from '@/hooks/useCart';

const overlayClasses =
  'fixed inset-0 z-50 bg-primary/40 transition-opacity duration-300 ease-out motion-reduce:transition-none';
const panelClasses =
  'fixed inset-y-0 right-0 z-50 flex w-full max-w-md flex-col bg-background shadow-card transition-transform duration-300 ease-out motion-reduce:transition-none';
const headerClasses = 'flex items-center justify-between gap-4 border-b border-surfaceBorder px-6 py-5';
const closeButtonClasses =
  'flex min-h-10 min-w-10 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:bg-accent/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const bodyClasses = 'flex-1 overflow-y-auto px-6 py-4';
const emptyStateClasses = 'flex h-full flex-col items-center justify-center gap-4 text-center';
const itemListClasses = 'grid gap-4';
const itemRowClasses = 'flex gap-4';
const itemImageClasses = 'h-16 w-16 flex-shrink-0 rounded-lg object-cover object-center';
const itemInfoClasses = 'flex flex-1 flex-col gap-1';
const itemTopRowClasses = 'flex items-start justify-between gap-2';
const quantityControlsClasses = 'flex items-center gap-3';
const stepperButtonClasses =
  'flex min-h-8 min-w-8 items-center justify-center rounded-lg border border-surfaceBorder bg-accent/10 font-body text-small font-medium text-primary transition-colors duration-200 hover:border-button hover:bg-button hover:text-button-text';
const footerClasses = 'grid gap-4 border-t border-surfaceBorder px-6 py-5';
const subtotalRowClasses = 'flex items-center justify-between';

export function CartDrawer() {
  const cart = useCart();
  const { isCartDrawerOpen, closeCartDrawer } = cart;

  useEffect(() => {
    if (!isCartDrawerOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeCartDrawer();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isCartDrawerOpen, closeCartDrawer]);

  return (
    <>
      <div
        className={classNames(overlayClasses, isCartDrawerOpen ? 'opacity-100' : 'pointer-events-none opacity-0')}
        onClick={closeCartDrawer}
        aria-hidden="true"
      />
      <aside
        className={classNames(panelClasses, isCartDrawerOpen ? 'translate-x-0' : 'translate-x-full')}
        role="dialog"
        aria-modal="true"
        aria-label="Your order"
      >
        <div className={headerClasses}>
          <Heading level={3}>Your Order</Heading>
          <button
            type="button"
            className={closeButtonClasses}
            onClick={closeCartDrawer}
            aria-label="Close cart"
          >
            ✕
          </button>
        </div>

        <div className={bodyClasses}>
          {cart.items.length === 0 ? (
            <div className={emptyStateClasses}>
              <Text className="text-primary/90">Your cart is empty.</Text>
              <Button variant="secondary" onClick={closeCartDrawer}>
                Continue Shopping
              </Button>
            </div>
          ) : (
            <div className={itemListClasses}>
              {cart.items.map((item) => (
                <div key={item.id} className={itemRowClasses}>
                  <Image src={item.image} alt={item.name} width={64} height={64} className={itemImageClasses} />
                  <div className={itemInfoClasses}>
                    <div className={itemTopRowClasses}>
                      <Text size="small" className="font-medium">
                        {item.name}
                      </Text>
                      <Text size="small" className="font-medium text-primary">
                        ${(item.price * item.quantity).toFixed(2)}
                      </Text>
                    </div>
                    <div className={quantityControlsClasses}>
                      <button
                        type="button"
                        className={stepperButtonClasses}
                        onClick={() => cart.decreaseQuantity(item.id)}
                        aria-label={`Decrease ${item.name} quantity`}
                      >
                        −
                      </button>
                      <Text size="small" aria-live="polite">
                        {item.quantity}
                      </Text>
                      <button
                        type="button"
                        className={stepperButtonClasses}
                        onClick={() => cart.increaseQuantity(item)}
                        disabled={item.availability === 'sold-out' || item.quantity >= item.stockQuantity}
                        aria-label={`Increase ${item.name} quantity`}
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {cart.items.length > 0 ? (
          <div className={footerClasses}>
            <div className={subtotalRowClasses}>
              <Text className="font-medium">Subtotal</Text>
              <Text className="font-medium">${cart.subtotal.toFixed(2)}</Text>
            </div>
            <Link
              href={
                cart.isReadyForCheckout &&
                (hasStoredCheckoutCustomerInfo() || hasStoredAccountCustomer())
                  ? '/checkout/auth'
                  : '/pickup'
              }
              onClick={closeCartDrawer}
            >
              <Button fullWidth>Continue to Checkout</Button>
            </Link>
            <Button variant="secondary" fullWidth onClick={closeCartDrawer}>
              Continue Shopping
            </Button>
          </div>
        ) : null}
      </aside>
    </>
  );
}
