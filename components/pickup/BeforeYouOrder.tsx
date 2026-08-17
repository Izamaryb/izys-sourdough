'use client';

import { Heading, Text } from '@/components/ui';

const guidelines = [
  {
    number: '01',
    title: 'Wednesday pickup schedule',
    description: 'Bakes happen Wednesday morning; your selected slot is when your bread is ready.',
  },
  {
    number: '02',
    title: 'Pickup only',
    description: 'This is a local pickup bakery—no delivery or shipping is available.',
  },
];

const headerClasses = 'flex flex-col gap-3';
const listClasses = 'mt-8 flex flex-col gap-6';
const itemClasses = 'flex gap-4';
const numberClasses = 'w-8 shrink-0 font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';
const titleClasses = 'font-body text-body font-medium text-primary';
const descriptionClasses = 'mt-1 text-small text-primary/90';

export function BeforeYouOrder() {
  return (
    <section aria-labelledby="before-you-order-heading">
      <div className={headerClasses}>
        <Heading id="before-you-order-heading" level={2}>
          Before You Order
        </Heading>
        <Text className="text-primary/90">
          Each bake is planned around preorder demand so every loaf stays fresh,
          manageable, and ready for local pickup.
        </Text>
      </div>
      <ol className={listClasses}>
        {guidelines.map((guideline) => (
          <li key={guideline.number} className={itemClasses}>
            <span className={numberClasses} aria-hidden="true">
              {guideline.number}
            </span>
            <div>
              <p className={titleClasses}>{guideline.title}</p>
              <p className={descriptionClasses}>{guideline.description}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
