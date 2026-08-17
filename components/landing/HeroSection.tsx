'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { SectionContainer, useScrollReveal } from '@/components/layout';
import { Button, Heading, Text } from '@/components/ui';

const heroSectionClasses = '!w-full !py-0 px-0';
const heroFrameClasses = 'relative min-h-[calc(100svh-72px)] overflow-hidden bg-primary sm:min-h-[760px]';
const imageClasses = 'object-cover object-center transition-[opacity,transform] duration-[400ms] ease-out motion-reduce:transition-none';
const overlayClasses = 'absolute inset-0 bg-gradient-to-b from-primary/80 via-primary/70 to-primary/80';
const focalOverlayClasses = 'absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(74,59,47,0.55),rgba(74,59,47,0.82))]';
const contentClasses = 'relative z-10 flex min-h-[calc(100svh-72px)] items-center justify-center px-4 py-16 text-center sm:min-h-[760px]';
const copyClasses = 'relative mx-auto flex max-w-3xl flex-col items-center gap-4 overflow-hidden rounded-lg border border-button-text/20 bg-primary/60 px-5 py-8 shadow-card backdrop-blur-[2px] sm:px-8 sm:py-10';
const copyOverlayClasses = 'absolute inset-0 bg-primary/25';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.24em] text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.45)]';
const headlineClasses = 'max-w-[10ch] text-[42px] leading-[1.05] tracking-[-0.02em] text-white drop-shadow-[0_3px_18px_rgba(0,0,0,0.55)] sm:max-w-none sm:text-[56px] lg:text-[64px]';
const subheadlineClasses = 'max-w-xl text-body font-medium text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]';
const actionClasses = 'mt-4 flex w-full max-w-xs flex-col items-center gap-3 sm:max-w-none';
const pickupClasses = 'text-white drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]';
const buttonClasses = 'border-secondary bg-secondary px-8 text-button-text shadow-card hover:border-button hover:bg-button';

export function HeroSection() {
  const reveal = useScrollReveal();
  const [isImageLoaded, setIsImageLoaded] = useState(false);

  return (
    <SectionContainer
      ref={reveal.ref}
      className={`${heroSectionClasses} ${reveal.className}`}
      spacing="sm"
      aria-labelledby="hero-heading"
    >
      <div className={heroFrameClasses}>
        <Image
          src="/images/hero-sourdough2.JPG"
          alt="Artisan sourdough loaves with golden crusts"
          fill
          priority
          sizes="100vw"
          className={`${imageClasses} ${isImageLoaded ? 'translate-y-0 opacity-100' : 'translate-y-1 opacity-0'}`}
          onLoad={() => setIsImageLoaded(true)}
        />
        <div className={overlayClasses} aria-hidden="true" />
        <div className={focalOverlayClasses} aria-hidden="true" />
        <div className={contentClasses}>
          <div className={copyClasses}>
            <div className={copyOverlayClasses} aria-hidden="true" />
            <div className="relative z-10 flex flex-col items-center gap-4">
              <p className={eyebrowClasses}>IZY&apos;S SOURDOUGH</p>
              <Heading id="hero-heading" level={1} className={headlineClasses}>
                Small Batch Artisan Sourdough
              </Heading>
              <Text className={subheadlineClasses}>
                Handcrafted sourdough bread made locally in small batches for fresh weekly pickup.
              </Text>
              <div className={actionClasses}>
                <Link href="/menu" className="w-full">
                  <Button fullWidth className={buttonClasses}>
                    Order Pickup
                  </Button>
                </Link>
                <Text size="small" className={pickupClasses}>
                  Baked fresh on pickup morning
                </Text>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionContainer>
  );
}
