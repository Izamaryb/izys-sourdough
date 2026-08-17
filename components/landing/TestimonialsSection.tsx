'use client';

import { useEffect, useRef, useState } from 'react';
import { SectionContainer, useScrollReveal } from '@/components/layout';
import { Button, Heading, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import { TestimonialCard } from './TestimonialCard';

const testimonials = [
  {
    customerName: 'Maria',
    quote: 'The crust was perfect and the bread still tasted warm and fresh when we brought it home.',
    detail: 'Favorite loaf: Classic Country Loaf',
  },
  {
    customerName: 'Angela',
    quote: 'Pickup was simple, and the jalapeño cheddar loaf disappeared before dinner was over.',
    detail: 'Repeat local customer',
  },
  {
    customerName: 'Denise',
    quote: 'You can tell it is made with care. It feels special without being fussy.',
    detail: 'Loves Wednesday pickup',
  },
];

const headerClasses = 'mx-auto flex max-w-2xl flex-col items-center gap-3 text-center';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const introClasses = 'max-w-xl text-body font-medium text-primary/90';
const carouselClasses = 'mx-auto mt-12 max-w-2xl';
const viewportClasses = 'grid overflow-hidden';
const testimonialTransitionClasses = 'transition-opacity motion-reduce:transition-none';
const controlsClasses = 'mt-6 flex items-center justify-between gap-4';
const dotsClasses = 'flex items-center justify-center gap-2';
const dotClasses = 'h-2.5 w-2.5 rounded-full border border-button';

export function TestimonialsSection() {
  const reveal = useScrollReveal();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [isTestimonialVisible, setIsTestimonialVisible] = useState(true);
  const exitTimeoutRef = useRef<number | null>(null);
  const enterTimeoutRef = useRef<number | null>(null);

  function getPreviousIndex(index: number) {
    return index === 0 ? testimonials.length - 1 : index - 1;
  }

  function getNextIndex(index: number) {
    return index === testimonials.length - 1 ? 0 : index + 1;
  }

  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        window.clearTimeout(exitTimeoutRef.current);
      }

      if (enterTimeoutRef.current) {
        window.clearTimeout(enterTimeoutRef.current);
      }
    };
  }, []);

  function showTestimonial(index: number) {
    if (index === activeIndex) {
      return;
    }

    if (exitTimeoutRef.current) {
      window.clearTimeout(exitTimeoutRef.current);
    }

    if (enterTimeoutRef.current) {
      window.clearTimeout(enterTimeoutRef.current);
    }

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    setActiveIndex(index);

    if (prefersReducedMotion) {
      setDisplayedIndex(index);
      setIsTestimonialVisible(true);
      return;
    }

    setIsTestimonialVisible(false);

    exitTimeoutRef.current = window.setTimeout(() => {
      setDisplayedIndex(index);
      enterTimeoutRef.current = window.setTimeout(() => {
        setIsTestimonialVisible(true);
      }, 20);
    }, 200);
  }

  function showPreviousTestimonial() {
    showTestimonial(getPreviousIndex(activeIndex));
  }

  function showNextTestimonial() {
    showTestimonial(getNextIndex(activeIndex));
  }

  return (
    <SectionContainer ref={reveal.ref} className={reveal.className} spacing="lg" aria-labelledby="testimonials-heading">
      <div className={headerClasses}>
        <p className={eyebrowClasses}>Local love</p>
        <Heading id="testimonials-heading" level={2}>
          What Customers Are Saying
        </Heading>
        <Text className={introClasses}>
          Fresh handcrafted sourdough, simple weekly pickup, and kind local support from the community.
        </Text>
      </div>
      <div className={carouselClasses} aria-live="polite">
        <div className={viewportClasses}>
          {testimonials.map((testimonial, index) => (
            <div
              key={testimonial.customerName}
              className={classNames(
                '[grid-area:1/1]',
                testimonialTransitionClasses,
                index === displayedIndex
                  ? isTestimonialVisible
                    ? 'opacity-100 duration-[260ms] ease-in-out'
                    : 'opacity-0 duration-200 ease-out'
                  : 'invisible opacity-0',
              )}
              aria-hidden={index !== displayedIndex}
            >
              <TestimonialCard {...testimonial} />
            </div>
          ))}
        </div>
        <div className={controlsClasses}>
          <Button variant="secondary" onClick={showPreviousTestimonial} aria-label="Show previous testimonial">
            Previous
          </Button>
          <div className={dotsClasses} aria-label="Testimonial position">
            {testimonials.map((testimonial, index) => (
              <button
                key={testimonial.customerName}
                type="button"
                className={classNames(
                  dotClasses,
                  index === activeIndex ? 'bg-button' : 'bg-transparent',
                )}
                onClick={() => showTestimonial(index)}
                aria-label={`Show testimonial ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
              />
            ))}
          </div>
          <Button variant="secondary" onClick={showNextTestimonial} aria-label="Show next testimonial">
            Next
          </Button>
        </div>
      </div>
    </SectionContainer>
  );
}
