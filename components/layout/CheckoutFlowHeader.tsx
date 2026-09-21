'use client';

import { usePathname } from 'next/navigation';
import { useCart } from '@/hooks/useCart';
import { CheckoutHeader, type CheckoutStep } from './CheckoutHeader';

function getSteps(pathname: string, isReadyForCheckout: boolean, isPlacingOrder: boolean): CheckoutStep[] {
  if (pathname === '/checkout') {
    return [
      { label: 'Pickup', status: 'completed' },
      { label: 'Account', status: 'completed' },
      { label: 'Review', status: isPlacingOrder ? 'completed' : 'active' },
    ];
  }

  if (pathname === '/checkout/auth') {
    return [
      { label: 'Pickup', status: 'completed' },
      { label: 'Account', status: 'active' },
      { label: 'Review', status: 'upcoming' },
    ];
  }

  return [
    { label: 'Pickup', status: isReadyForCheckout ? 'completed' : 'active' },
    { label: 'Account', status: 'upcoming' },
    { label: 'Review', status: 'upcoming' },
  ];
}

export function CheckoutFlowHeader() {
  const pathname = usePathname();
  const cart = useCart();
  const steps = getSteps(pathname, cart.isReadyForCheckout, cart.isPlacingOrder);
  return <CheckoutHeader steps={steps} />;
}
