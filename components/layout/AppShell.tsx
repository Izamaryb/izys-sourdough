'use client';

import { usePathname } from 'next/navigation';
import { CheckoutFlowHeader } from './CheckoutFlowHeader';
import { Footer } from './Footer';
import { Navbar } from './Navbar';

const CHECKOUT_FLOW_ROUTES = ['/pickup', '/checkout/auth', '/checkout'];

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isCheckoutFlow = CHECKOUT_FLOW_ROUTES.includes(pathname);
  const isAdminRoute = pathname?.startsWith('/admin');

  return (
    <div className="page-shell">
      {isAdminRoute ? null : isCheckoutFlow ? <CheckoutFlowHeader /> : <Navbar />}
      {children}
      {isAdminRoute ? null : <Footer />}
    </div>
  );
}
