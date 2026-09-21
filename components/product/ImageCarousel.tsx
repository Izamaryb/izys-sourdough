'use client';

import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { classNames } from '@/lib/classNames';

const SWIPE_THRESHOLD_PX = 40;
const WHEEL_LOCK_MS = 350;
const SLIDE_TRANSITION = 'transform 480ms cubic-bezier(0.16, 1, 0.3, 1)';

function getRelativeOffset(slideIndex: number, baseIndex: number, total: number) {
  let relative = slideIndex - baseIndex;
  const half = total / 2;

  if (relative > half) {
    relative -= total;
  } else if (relative < -half) {
    relative += total;
  }

  return relative;
}

type ImageCarouselProps = {
  image: string;
  alt: string;
  wrapClassName: string;
  imageClassName?: string;
  overlay?: React.ReactNode;
  placeholderCount?: number;
};

const arrowButtonClasses =
  'absolute top-1/2 z-20 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/85 text-primary opacity-0 shadow-sm transition-opacity duration-200 group-hover:opacity-100 group-focus-within:opacity-100 hover:bg-white';

function BreadPlaceholderIcon({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      className={className}
      aria-hidden="true"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4 10.5c0-3.038 3.582-5.5 8-5.5s8 2.462 8 5.5c0 .552-.336 1-.9 1.12C17.86 11.86 15.06 12 12 12s-5.86-.14-7.1-.38c-.564-.12-.9-.568-.9-1.12z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M4.5 11.5 4 17a2 2 0 0 0 2 2.2h12A2 2 0 0 0 20 17l-.5-5.5"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12v-1.5M15 12v-1.5" />
    </svg>
  );
}

export function ImageCarousel({
  image,
  alt,
  wrapClassName,
  imageClassName,
  overlay,
  placeholderCount = 2,
}: ImageCarouselProps) {
  const slides = [image, ...Array.from<string | null>({ length: placeholderCount }).fill(null)];
  const [index, setIndex] = useState(0);
  const total = slides.length;
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef(0);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const slideRefs = useRef<Array<HTMLDivElement | null>>([]);
  const wheelAccumRef = useRef(0);
  const wheelLockedRef = useRef(false);

  function applyTransforms(baseIndex: number, offsetPx: number, withTransition: boolean) {
    slideRefs.current.forEach((el, i) => {
      if (!el) {
        return;
      }

      el.style.transition = withTransition ? SLIDE_TRANSITION : 'none';
      el.style.transform = `translate3d(calc(${getRelativeOffset(i, baseIndex, total) * 100}% + ${offsetPx}px), 0, 0)`;
    });
  }

  function goTo(next: number) {
    setIndex(((next % total) + total) % total);
  }

  useEffect(() => {
    applyTransforms(index, 0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container || total <= 1) {
      return;
    }

    function handleWheel(e: WheelEvent) {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) {
        return;
      }

      e.preventDefault();

      if (wheelLockedRef.current) {
        return;
      }

      wheelAccumRef.current += e.deltaX;

      if (Math.abs(wheelAccumRef.current) > SWIPE_THRESHOLD_PX) {
        const direction = wheelAccumRef.current > 0 ? 1 : -1;
        wheelAccumRef.current = 0;
        wheelLockedRef.current = true;
        setIndex((prev) => ((prev + direction) % total + total) % total);
        window.setTimeout(() => {
          wheelLockedRef.current = false;
        }, WHEEL_LOCK_MS);
      }
    }

    container.addEventListener('wheel', handleWheel, { passive: false });

    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, [total]);

  function handleTouchStart(e: React.TouchEvent) {
    if (total <= 1) {
      return;
    }

    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
  }

  function handleTouchMove(e: React.TouchEvent) {
    if (touchStartX.current === null) {
      return;
    }

    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    applyTransforms(index, touchDeltaX.current, false);
  }

  function handleTouchEnd() {
    if (touchStartX.current === null) {
      return;
    }

    const delta = touchDeltaX.current;
    let newIndex = index;

    if (delta <= -SWIPE_THRESHOLD_PX) {
      newIndex = (index + 1 + total) % total;
    } else if (delta >= SWIPE_THRESHOLD_PX) {
      newIndex = (index - 1 + total) % total;
    }

    applyTransforms(newIndex, 0, true);
    setIndex(newIndex);

    touchStartX.current = null;
    touchDeltaX.current = 0;
  }

  return (
    <div className={classNames('group', wrapClassName)}>
      <div
        ref={containerRef}
        className="relative h-full w-full touch-pan-y select-none overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {slides.map((slide, i) => (
          <div
            key={i}
            ref={(el) => {
              slideRefs.current[i] = el;
            }}
            style={{ transform: `translate3d(${getRelativeOffset(i, index, total) * 100}%, 0, 0)` }}
            className={classNames(
              'absolute inset-0',
              i === index ? '' : 'pointer-events-none',
            )}
            aria-hidden={i === index ? undefined : true}
          >
            {typeof slide === 'string' ? (
              <Image
                src={slide}
                alt={alt}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1024px) 900px, 1040px"
                className={classNames('object-cover object-center', imageClassName)}
              />
            ) : (
              <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-accent/20 text-primary/40">
                <BreadPlaceholderIcon className="h-10 w-10" />
                <span className="font-body text-small font-medium uppercase tracking-[0.14em]">
                  Photo coming soon
                </span>
              </div>
            )}
          </div>
        ))}
      </div>

      {overlay ? <div className="pointer-events-none absolute inset-0 z-10">{overlay}</div> : null}

      {total > 1 ? (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={() => goTo(index - 1)}
            className={classNames(arrowButtonClasses, 'left-2')}
          >
            <span aria-hidden="true">&#8249;</span>
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={() => goTo(index + 1)}
            className={classNames(arrowButtonClasses, 'right-2')}
          >
            <span aria-hidden="true">&#8250;</span>
          </button>
          <div className="absolute inset-x-0 bottom-2 z-20 flex items-center justify-center gap-1.5">
            {slides.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={classNames(
                  'h-1.5 w-1.5 rounded-full transition-colors duration-200',
                  i === index ? 'bg-white' : 'bg-white/50',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
