'use client';

import { useEffect, useRef } from 'react';
import { CartIcon } from './CartIcon';
import { useCart } from '@/hooks/useCart';
import { classNames } from '@/lib/classNames';

const FLYOVER_SIZE = 48;
const FLYOVER_DURATION_MS = 700;
const CART_ICON_SELECTOR = '[data-cart-icon]';

function getVisibleCartIcon(): HTMLElement | null {
  const icons = document.querySelectorAll<HTMLElement>(CART_ICON_SELECTOR);
  for (let i = 0; i < icons.length; i += 1) {
    const rect = icons[i].getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      return icons[i];
    }
  }
  return null;
}

const flyoverClasses =
  'fixed z-[60] flex h-12 w-12 items-center justify-center rounded-full border-2 border-background bg-button text-button-text shadow-card pointer-events-none';

export function CartFlyover() {
  const cart = useCart();
  const { flyover, cartIconRef, clearAddToCartAnimation } = cart;
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!flyover) {
      return;
    }

    const targetElement = getVisibleCartIcon() ?? cartIconRef.current;
    const flyoverElement = elementRef.current;

    if (!targetElement || !flyoverElement) {
      clearAddToCartAnimation();
      return;
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    if (prefersReducedMotion) {
      clearAddToCartAnimation();
      return;
    }

    const targetRect = targetElement.getBoundingClientRect();
    const startRect = flyover.startRect;

    const startCenterX = startRect.left + startRect.width / 2;
    const startCenterY = startRect.top + startRect.height / 2;
    const targetCenterX = targetRect.left + targetRect.width / 2;
    const targetCenterY = targetRect.top + targetRect.height / 2;

    const deltaX = targetCenterX - startCenterX;
    const deltaY = targetCenterY - startCenterY;

    // Force a synchronous layout so the initial position renders before the transition.
    void flyoverElement.offsetWidth;

    const animationFrameId = requestAnimationFrame(() => {
      flyoverElement.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(0.15)`;
      flyoverElement.style.opacity = '0';
    });

    const timeoutId = window.setTimeout(() => {
      clearAddToCartAnimation();
    }, FLYOVER_DURATION_MS);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.clearTimeout(timeoutId);
    };
  }, [flyover, cartIconRef, clearAddToCartAnimation]);

  if (!flyover) {
    return null;
  }

  const startRect = flyover.startRect;
  const left = startRect.left + startRect.width / 2 - FLYOVER_SIZE / 2;
  const top = startRect.top + startRect.height / 2 - FLYOVER_SIZE / 2;

  return (
    <div
      key={flyover.key}
      ref={elementRef}
      aria-hidden="true"
      className={classNames(flyoverClasses)}
      style={{
        left,
        top,
        transition: `transform ${FLYOVER_DURATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${FLYOVER_DURATION_MS}ms ease-in`,
      }}
    >
      <CartIcon className="h-5 w-5" />
    </div>
  );
}
