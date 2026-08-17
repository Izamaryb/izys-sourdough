'use client';

import { useEffect, useRef, useState, type ReactNode, type RefObject } from 'react';
import { classNames } from '@/lib/classNames';

type ScrollRevealProps = {
  children: ReactNode;
  initial?: boolean;
};

const revealClasses = 'transition-[opacity,transform] duration-[750ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';

export function useScrollReveal(initial = false) {
  const ref = useRef<HTMLElement | null>(null);
  const [hasAnimated, setHasAnimated] = useState(initial);

  useEffect(() => {
    const element = ref.current;

    if (!element || hasAnimated) {
      return;
    }

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setHasAnimated(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }

        setHasAnimated(true);
        observer.disconnect();
      },
      { threshold: 0.18, rootMargin: '0px 0px -10% 0px' },
    );

    observer.observe(element);

    return () => observer.disconnect();
  }, [hasAnimated]);

  return {
    ref,
    className: classNames(revealClasses, hasAnimated ? 'translate-y-0 opacity-100' : 'translate-y-4 opacity-0'),
  };
}

export function ScrollReveal({ children, initial = false }: ScrollRevealProps) {
  const reveal = useScrollReveal(initial);

  return (
    <div ref={reveal.ref as RefObject<HTMLDivElement>} className={reveal.className}>
      {children}
    </div>
  );
}
