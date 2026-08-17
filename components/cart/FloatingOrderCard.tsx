'use client';

import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/classNames';
import { useCart } from '@/hooks/useCart';

const BUBBLE_SIZE = 56;
const CORNER_INSET = {
  mobile: { right: 16, bottom: 80 },
  desktop: { right: 24, bottom: 32 },
};
const BUBBLE_SHOWN_STORAGE_KEY = 'izys-sourdough-cart-bubble-shown';
const ENTER_TRANSITION_DURATION_MS = 800;
const CENTER_HOLD_DURATION_MS = 1000;

type BubblePosition = { top: number; left: number };

const bubbleClasses =
  'fixed z-40 flex h-14 w-14 items-center justify-center rounded-full border border-button bg-button text-2xl text-button-text shadow-card hover:border-button-hover hover:bg-button-hover focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const BUBBLE_TRANSITION = 'top 800ms cubic-bezier(0.22,1,0.36,1), left 800ms cubic-bezier(0.22,1,0.36,1), opacity 800ms cubic-bezier(0.22,1,0.36,1), transform 800ms cubic-bezier(0.22,1,0.36,1)';
const BUBBLE_TRANSITION_REDUCED_MOTION = 'opacity 200ms linear';
const badgeClasses = 'absolute -right-1 -top-1 flex h-6 min-w-6 items-center justify-center rounded-full border-2 border-background bg-accent px-1 font-body text-[13px] font-semibold leading-none text-primary';

function getCornerPosition(): BubblePosition {
  const isDesktop = window.innerWidth >= 768;
  const inset = isDesktop ? CORNER_INSET.desktop : CORNER_INSET.mobile;

  return {
    top: window.innerHeight - inset.bottom - BUBBLE_SIZE,
    left: window.innerWidth - inset.right - BUBBLE_SIZE,
  };
}

function getCenterPosition(): BubblePosition {
  return {
    top: window.innerHeight / 2 - BUBBLE_SIZE / 2,
    left: window.innerWidth / 2 - BUBBLE_SIZE / 2,
  };
}

export function FloatingOrderCard() {
  const pathname = usePathname();
  const cart = useCart();
  const hasItems = cart.items.length > 0;
  const isBubbleRoute = pathname === '/' || pathname === '/menu';
  const hadItemsRef = useRef(hasItems);

  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState<BubblePosition | null>(null);
  const [isAtCenter, setIsAtCenter] = useState(false);
  const [isEntering, setIsEntering] = useState(false);

  useLayoutEffect(() => {
    const hasShownBefore = window.sessionStorage.getItem(BUBBLE_SHOWN_STORAGE_KEY) === 'true';

    if (hasShownBefore || hasItems) {
      setIsVisible(true);
      setPosition(getCornerPosition());
    }

    hadItemsRef.current = hasItems;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const isFirstEverAddition = hasItems && !hadItemsRef.current;
    hadItemsRef.current = hasItems;

    if (!isFirstEverAddition) {
      return;
    }

    setPosition(getCenterPosition());
    setIsAtCenter(true);
    setIsVisible(true);
    setIsEntering(true);
    window.sessionStorage.setItem(BUBBLE_SHOWN_STORAGE_KEY, 'true');

    const enterFrameId = window.requestAnimationFrame(() => {
      setIsEntering(false);
    });

    const dockTimeoutId = window.setTimeout(() => {
      setPosition(getCornerPosition());
      setIsAtCenter(false);
    }, ENTER_TRANSITION_DURATION_MS + CENTER_HOLD_DURATION_MS);

    return () => {
      window.cancelAnimationFrame(enterFrameId);
      window.clearTimeout(dockTimeoutId);
    };
  }, [hasItems]);

  useEffect(() => {
    if (!isVisible || isAtCenter) {
      return;
    }

    function handleResize() {
      setPosition(getCornerPosition());
    }

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isVisible, isAtCenter]);

  if (!isBubbleRoute || !isVisible || !position) {
    return null;
  }

  const prefersReducedMotion =
    typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  return (
    <button
      type="button"
      onClick={cart.openCartDrawer}
      className={classNames(bubbleClasses, isEntering ? 'scale-95 opacity-0' : 'scale-100 opacity-100')}
      style={{
        top: position.top,
        left: position.left,
        transition: prefersReducedMotion ? BUBBLE_TRANSITION_REDUCED_MOTION : BUBBLE_TRANSITION,
      }}
      aria-label={`View order, ${cart.itemCount} item${cart.itemCount === 1 ? '' : 's'}`}
    >
      <span aria-hidden="true">🛒</span>
      {cart.itemCount > 0 ? (
        <span className={badgeClasses} aria-hidden="true">
          {cart.itemCount}
        </span>
      ) : null}
    </button>
  );
}
