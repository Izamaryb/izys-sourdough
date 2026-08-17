'use client';

import { SectionContainer, useScrollReveal } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

const steps = [
  {
    number: '01',
    title: 'Place your preorder',
    description: 'Choose your loaves ahead of time so your bread is reserved for the weekly bake.',
    icon: '✦',
  },
  {
    number: '02',
    title: 'We prep each loaf',
    description: 'Each loaf is shaped and slowly fermented ahead of pickup day for the best flavor and texture.',
    icon: '☼',
  },
  {
    number: '03',
    title: 'Baked fresh Wednesday',
    description: 'Your bread is baked on pickup morning, then ready to take home during your selected Wednesday window.',
    icon: '⌂',
  },
];

const headerClasses = 'mx-auto flex max-w-2xl flex-col items-center gap-3 text-center';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const introClasses = 'max-w-xl text-body font-medium text-primary/90';
const listClasses = 'mt-16 flex flex-col items-center gap-16 pb-16 md:gap-20 md:pb-20';
const stepClasses = 'max-w-md text-center';
const iconClasses = 'mb-4 text-xl text-accent/70';
const numberClasses = 'mb-3 font-heading text-h1 font-bold leading-none text-primary';
const stepTitleClasses = 'mb-3';
const stepTextClasses = 'text-small text-primary/90';

export function HowItWorksSection() {
  const reveal = useScrollReveal();

  return (
    <SectionContainer
      ref={reveal.ref}
      className={reveal.className}
      spacing="lg"
      topSpacing="spacious"
      aria-labelledby="how-it-works-heading"
    >
      <div className={headerClasses}>
        <p className={eyebrowClasses}>How it works</p>
        <Heading id="how-it-works-heading" level={2}>
          Fresh sourdough, simply planned
        </Heading>
        <Text className={introClasses}>
          Preorder your bread, then pick it up the same day it is baked with a simple weekly rhythm.
        </Text>
      </div>
      <ol className={listClasses}>
        {steps.map((step) => (
          <li key={step.number} className={stepClasses}>
            <div className={iconClasses} aria-hidden="true">
              {step.icon}
            </div>
            <p className={numberClasses}>{step.number}</p>
            <Heading level={3} className={stepTitleClasses}>
              {step.title}
            </Heading>
            <Text size="small" className={stepTextClasses}>
              {step.description}
            </Text>
          </li>
        ))}
      </ol>
    </SectionContainer>
  );
}
