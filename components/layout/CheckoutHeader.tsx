'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { CartIcon } from '@/components/cart';
import { CheckIcon } from '@/components/ui';
import { type StepStatus } from '@/components/ui/CheckoutStepProgress';
import { classNames } from '@/lib/classNames';
import { useCart } from '@/hooks/useCart';
import { MobileMenu, type NavigationLink } from './MobileMenu';

const navigationLinks: NavigationLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

const headerClasses = 'sticky top-0 z-50 border-b border-surfaceBorder bg-background';
const innerClasses = 'layout-container flex min-h-16 items-center justify-between gap-2 py-3 overflow-hidden';
const desktopNavClasses = 'hidden items-center gap-8 md:flex';
const navLinkClasses = 'font-body text-small font-medium text-secondary transition-colors duration-200 hover:text-primary';
const menuButtonClasses = 'inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-surfaceBorder bg-background font-body text-small font-medium text-primary transition-colors duration-200 hover:border-button hover:text-button md:hidden';
const menuIconClasses = 'flex flex-col gap-1.5';
const menuLineClasses = 'block h-0.5 w-5 rounded-lg bg-primary';
const cartButtonClasses =
  'relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:text-button focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const cartBadgeClasses =
  'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 font-body text-[11px] font-semibold leading-none text-primary';
const cartIconClasses = 'h-6 w-6';

export type CheckoutStep = {
  label: string;
  status: StepStatus;
};

type CheckoutHeaderProps = {
  steps: CheckoutStep[];
};

function HeaderCartButton() {
  const cart = useCart();

  return (
    <button
      ref={cart.cartIconRef}
      type="button"
      className={cartButtonClasses}
      onClick={cart.openCartDrawer}
      aria-label={`View order, ${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}`}
    >
      <CartIcon className={cartIconClasses} />
      {cart.itemCount > 0 ? (
        <span className={cartBadgeClasses} aria-hidden="true">
          {cart.itemCount}
        </span>
      ) : null}
    </button>
  );
}

const backButtonClasses =
  'inline-flex min-h-10 min-w-10 shrink-0 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:text-button focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const stepCircleBase =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-body text-small font-medium';
const completedCircleClasses = 'border-button bg-button text-button-text';
const activeCircleClasses = 'border-button bg-background text-button';
const upcomingCircleClasses = 'border-accent bg-background text-accent';
const stepLabelBase = 'ml-2 font-body text-small font-medium';
const completedLabelClasses = 'text-primary';
const activeLabelClasses = 'text-primary';
const upcomingLabelClasses = 'text-secondary';
const connectorClasses = 'mx-3 h-0.5 flex-1';
const completedConnectorClasses = 'bg-button';
const upcomingConnectorClasses = 'bg-accent';

function getCircleClasses(status: StepStatus) {
  if (status === 'completed') return completedCircleClasses;
  if (status === 'active') return activeCircleClasses;
  return upcomingCircleClasses;
}

function getLabelClasses(status: StepStatus) {
  if (status === 'completed') return completedLabelClasses;
  if (status === 'active') return activeLabelClasses;
  return upcomingLabelClasses;
}

function BackArrow() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="m12 19-7-7 7-7" />
    </svg>
  );
}

function InlineStepProgress({ steps }: { steps: CheckoutStep[] }) {
  const router = useRouter();

  return (
    <nav aria-label="Checkout progress" className="flex min-w-0 flex-1 items-center gap-3">
      <button type="button" className={backButtonClasses} onClick={() => router.back()} aria-label="Go back">
        <BackArrow />
      </button>
      <div className="flex min-w-0 flex-1 items-center">
        {steps.map((step, index) => (
          <div key={step.label} className={classNames('flex items-center', index > 0 && 'flex-1')}>
            {index > 0 && (
              <span
                className={classNames(
                  connectorClasses,
                  step.status === 'upcoming' ? upcomingConnectorClasses : completedConnectorClasses,
                )}
                aria-hidden="true"
              />
            )}
            <span className="flex shrink-0 items-center">
              <span className={classNames(stepCircleBase, getCircleClasses(step.status))}>
                {step.status === 'completed' ? <CheckIcon className="h-3.5 w-3.5" /> : <span>{index + 1}</span>}
              </span>
              <span className={classNames(stepLabelBase, getLabelClasses(step.status), 'hidden md:inline')}>
                {step.label}
              </span>
            </span>
          </div>
        ))}
      </div>
    </nav>
  );
}

export function CheckoutHeader({ steps }: CheckoutHeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className={headerClasses}>
      <div className={innerClasses}>
        <div className="hidden shrink-0 items-center gap-4 md:flex md:gap-6">
          <HeaderCartButton />
          <nav className={desktopNavClasses} aria-label="Primary navigation">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClasses}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <InlineStepProgress steps={steps} />

        <div className="flex shrink-0 items-center gap-2">
          <div className="md:hidden">
            <HeaderCartButton />
          </div>
          <button
            type="button"
            className={menuButtonClasses}
            onClick={() => setIsMenuOpen((currentState) => !currentState)}
            aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-controls="mobile-navigation"
            aria-expanded={isMenuOpen}
          >
            <span className={menuIconClasses} aria-hidden="true">
              <span className={menuLineClasses} />
              <span className={menuLineClasses} />
              <span className={menuLineClasses} />
            </span>
          </button>
        </div>
      </div>
      <MobileMenu links={navigationLinks} isOpen={isMenuOpen} onLinkClick={closeMenu} />
    </header>
  );
}
