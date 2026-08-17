'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CartIcon } from '@/components/cart';
import { Button } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { MobileMenu, type NavigationLink } from './MobileMenu';

const navigationLinks: NavigationLink[] = [
  { label: 'Home', href: '/' },
  { label: 'Menu', href: '/menu' },
  { label: 'About', href: '/about' },
  { label: 'FAQ', href: '/faq' },
];

const headerClasses = 'sticky top-0 z-50 border-b border-surfaceBorder bg-background';
const innerClasses = 'layout-container flex min-h-16 items-center justify-between gap-4 py-3';
const logoClasses = 'font-heading text-h3 font-bold tracking-[0.08em] text-primary';
const desktopNavClasses = 'hidden items-center gap-8 md:flex';
const navLinkClasses = 'font-body text-small font-medium text-secondary transition-colors duration-200 hover:text-primary';
const desktopActionsClasses = 'hidden md:block';
const menuButtonClasses = 'inline-flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-surfaceBorder bg-background font-body text-small font-medium text-primary transition-colors duration-200 hover:border-button hover:text-button md:hidden';
const menuIconClasses = 'flex flex-col gap-1.5';
const menuLineClasses = 'block h-0.5 w-5 rounded-lg bg-primary';
const cartButtonClasses =
  'relative inline-flex min-h-10 min-w-10 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:text-button focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const cartBadgeClasses =
  'absolute -right-0.5 -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full border-2 border-background bg-accent px-1 font-body text-[11px] font-semibold leading-none text-primary';
const cartIconClasses = 'h-6 w-6';

function HeaderCartButton() {
  const cart = useCart();

  return (
    <button
      ref={cart.cartIconRef}
      type="button"
      data-cart-icon
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

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  function closeMenu() {
    setIsMenuOpen(false);
  }

  return (
    <header className={headerClasses}>
      <div className={innerClasses}>
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/" className={logoClasses} onClick={closeMenu}>
            IZY&apos;S SOURDOUGH
          </Link>
          <div className="hidden md:block">
            <HeaderCartButton />
          </div>
          <nav className={desktopNavClasses} aria-label="Primary navigation">
            {navigationLinks.map((link) => (
              <Link key={link.href} href={link.href} className={navLinkClasses}>
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-2 md:hidden">
          <HeaderCartButton />
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
        <div className={desktopActionsClasses}>
          <Link href="/menu">
            <Button>Order Now</Button>
          </Link>
        </div>
      </div>
      <MobileMenu links={navigationLinks} isOpen={isMenuOpen} onLinkClick={closeMenu} />
    </header>
  );
}
