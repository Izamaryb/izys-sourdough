import { FaqAccordion } from '@/components/faq';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Heading, Text } from '@/components/ui';

const faqItems = [
  {
    question: 'How does ordering work?',
    answer: 'Customers place orders in advance for weekly Wednesday pickup.',
  },
  {
    question: 'When do orders close?',
    answer: 'Orders close 48 hours before pickup unless extra inventory is available.',
  },
  {
    question: 'When is pickup?',
    answer: 'Pickup is available on Wednesdays during scheduled pickup windows.',
  },
  {
    question: 'Do you offer delivery?',
    answer: 'No. At this time, all orders are pickup only.',
  },
  {
    question: 'Can I place same-day orders?',
    answer: 'Only if extra inventory is available after preorder fulfillment.',
  },
  {
    question: 'What happens if bread sells out?',
    answer: 'Once weekly inventory is sold out, ordering closes until the next pickup week.',
  },
  {
    question: 'How should I store my sourdough?',
    answer: 'Store bread at room temperature in a bread bag or wrapped in a towel. For longer storage, slice and freeze.',
  },
  {
    question: 'How long does sourdough stay fresh?',
    answer: 'Sourdough is best enjoyed fresh but typically stays good for several days when stored properly.',
  },
  {
    question: 'Are ingredients listed?',
    answer: 'Yes. Every product includes ingredient and allergen information.',
  },
];

const heroClasses = 'flex max-w-3xl flex-col items-start gap-4';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const descriptionClasses = 'max-w-2xl text-body font-medium text-primary/90';
const accordionWrapClasses = 'mx-auto max-w-3xl';
const helpCardClasses = 'mx-auto max-w-3xl rounded-lg border border-surfaceBorder bg-accent/10 p-6 shadow-card sm:p-8';

export default function FaqPage() {
  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="faq-heading">
        <div className={heroClasses}>
          <p className={eyebrowClasses}>Frequently Asked Questions</p>
          <Heading id="faq-heading" level={1}>
            Everything You Need to Know
          </Heading>
          <Text className={descriptionClasses}>
            Find quick answers about ordering, Wednesday pickup, limited weekly inventory, and how to care for your sourdough once it gets home.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm" aria-label="FAQ accordion">
        <div className={accordionWrapClasses}>
          <FaqAccordion items={faqItems} />
        </div>
      </SectionContainer>

      <SectionContainer spacing="lg" aria-labelledby="faq-help-heading">
        <aside className={helpCardClasses}>
          <p className={eyebrowClasses}>Still wondering?</p>
          <Heading id="faq-help-heading" level={2} className="mt-3">
            We keep things simple and local
          </Heading>
          <Text className="mt-3 text-primary/90">
            Each weekly bake is planned around preorder demand, limited inventory, and a pickup-only rhythm so every loaf stays fresh and manageable.
          </Text>
        </aside>
      </SectionContainer>
    </PageContainer>
  );
}
