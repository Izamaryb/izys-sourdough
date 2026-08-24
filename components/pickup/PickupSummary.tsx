import { Heading } from '@/components/ui';

type PickupSummaryItem = {
  name: string;
  quantity: number;
  lineTotal: number;
};

type PickupSummaryProps = {
  items: PickupSummaryItem[];
  subtotal: number;
  selectedDateLabel?: string;
  selectedTime?: string;
};

const cardClasses = 'cursor-default rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const listClasses = 'mt-5 grid gap-3';
const rowClasses = 'flex items-start justify-between gap-4 border-b border-surfaceBorder pb-3 last:border-b-0 last:pb-0';
const itemTextClasses = 'font-body text-small font-medium text-primary';
const metaClasses = 'font-body text-small text-secondary';
const totalClasses = 'mt-5 flex items-center justify-between gap-4 rounded-lg bg-accent/10 px-4 py-3 font-body text-body font-medium text-primary';
const pickupGridClasses = 'mt-5 grid gap-3 sm:grid-cols-2';
const pickupBoxClasses = 'cursor-default px-1 py-2';
const labelClasses = 'font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';
const valueClasses = 'mt-1 font-body text-body font-medium text-primary';
const valueLinkClasses =
  'mt-1 inline-flex font-body text-body font-medium text-primary underline decoration-secondary/60 underline-offset-4 transition-colors duration-200 hover:text-secondary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';

export function PickupSummary({ items, subtotal, selectedDateLabel, selectedTime }: PickupSummaryProps) {
  return (
    <aside className={cardClasses} aria-labelledby="pickup-summary-heading">
      <Heading id="pickup-summary-heading" level={2}>
        Order Summary
      </Heading>
      <div className={listClasses}>
        {items.map((item) => (
          <div key={item.name} className={rowClasses}>
            <div>
              <p className={itemTextClasses}>{item.name}</p>
              <p className={metaClasses}>Quantity: {item.quantity}</p>
            </div>
            <p className={itemTextClasses}>${item.lineTotal.toFixed(2)}</p>
          </div>
        ))}
      </div>
      <div className={totalClasses}>
        <span>Estimated subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>
      <div className={pickupGridClasses}>
        <div className={pickupBoxClasses}>
          <p className={labelClasses}>Pickup Date</p>
          {selectedDateLabel ? (
            <a href="/pickup#pickup-heading" className={valueLinkClasses}>
              {selectedDateLabel}
            </a>
          ) : (
            <p className={valueClasses}>Not selected</p>
          )}
        </div>
        <div className={pickupBoxClasses}>
          <p className={labelClasses}>Pickup Time</p>
          {selectedTime ? (
            <a href="/pickup#pickup-heading" className={valueLinkClasses}>
              {selectedTime}
            </a>
          ) : (
            <p className={valueClasses}>Not selected</p>
          )}
        </div>
      </div>
    </aside>
  );
}
