import { SectionContainer } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

const scheduleItems = [
  {
    day: 'Monday',
    title: 'Preorders close',
    description: 'Orders close Monday evening at 8 p.m. so each bake stays small and intentional.',
  },
  {
    day: 'Tuesday',
    title: 'Prep day',
    description: 'Each loaf is prepared and shaped so it is ready for a fresh Wednesday bake.',
  },
  {
    day: 'Wednesday',
    title: 'Bake and pickup day',
    description: 'Your bread is baked fresh and ready for pickup the same day during your selected local window.',
  },
];

const details = [
  '48-hour preorder cutoff',
  'Pickup only',
  'Limited weekly inventory',
  'Order up to 2 weeks in advance',
];

const sectionGridClasses = 'grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-start lg:gap-12';
const headerClasses = 'flex max-w-xl flex-col items-start gap-3';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const introClasses = 'text-body font-medium text-primary/90';
const panelClasses = 'rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const timelineClasses = 'grid gap-6';
const itemClasses = 'grid grid-cols-[auto_1fr] gap-4';
const markerClasses = 'flex h-12 w-12 items-center justify-center rounded-lg border border-surfaceBorder bg-accent/20 font-body text-small font-medium text-primary';
const detailListClasses = 'mt-6 grid gap-3 border-t border-surfaceBorder pt-6 sm:grid-cols-2';
const detailClasses = 'rounded-lg border border-surfaceBorder bg-accent/10 px-4 py-3 font-body text-small font-medium text-primary';

export function PickupScheduleSection() {
  return (
    <SectionContainer spacing="lg" aria-labelledby="pickup-schedule-heading">
      <div className={sectionGridClasses}>
        <div className={headerClasses}>
          <p className={eyebrowClasses}>Pickup rhythm</p>
          <Heading id="pickup-schedule-heading" level={2}>
            Weekly Pickup Schedule
          </Heading>
          <Text className={introClasses}>
            Fresh baked weekly sourdough is available by preorder for local Wednesday pickup.
          </Text>
        </div>
        <div className={panelClasses}>
          <ol className={timelineClasses}>
            {scheduleItems.map((item) => (
              <li key={item.day} className={itemClasses}>
                <div className={markerClasses} aria-hidden="true">
                  {item.day.slice(0, 3)}
                </div>
                <div className="grid gap-2">
                  <Text size="small" className="font-medium uppercase tracking-[0.16em] text-secondary">
                    {item.day}
                  </Text>
                  <Heading level={3}>{item.title}</Heading>
                  <Text size="small" className="text-primary/90">
                    {item.description}
                  </Text>
                </div>
              </li>
            ))}
          </ol>
          <ul className={detailListClasses}>
            {details.map((detail) => (
              <li key={detail} className={detailClasses}>
                {detail}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </SectionContainer>
  );
}
