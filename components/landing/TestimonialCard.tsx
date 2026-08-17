import { Heading, Text } from '@/components/ui';

type TestimonialCardProps = {
  customerName: string;
  quote: string;
  detail: string;
  rating?: number;
};

const cardClasses = 'flex h-full flex-col gap-5 rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const starsClasses = 'font-body text-small tracking-[0.12em] text-secondary';
const quoteClasses = 'text-body font-medium text-primary';
const detailClasses = 'mt-auto border-t border-surfaceBorder pt-4 text-small text-primary/90';

export function TestimonialCard({
  customerName,
  quote,
  detail,
  rating = 5,
}: TestimonialCardProps) {
  return (
    <article className={cardClasses}>
      <div className={starsClasses} aria-label={`${rating} out of 5 stars`}>
        {'★'.repeat(rating)}
      </div>
      <blockquote>
        <Text className={quoteClasses}>&ldquo;{quote}&rdquo;</Text>
      </blockquote>
      <div className="grid gap-1">
        <Heading level={3}>{customerName}</Heading>
        <Text size="small" className={detailClasses}>
          {detail}
        </Text>
      </div>
    </article>
  );
}
