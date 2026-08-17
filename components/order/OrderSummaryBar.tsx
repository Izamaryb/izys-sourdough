import { Button } from '@/components/ui';

type OrderSummaryBarProps = {
  totalItems: number;
  subtotal: number;
  selectedDateLabel?: string;
  selectedTime?: string;
  continueLabel?: string;
  onContinue: () => void;
};

const wrapperClasses = 'sticky bottom-0 z-40 border-t border-surfaceBorder bg-background/95 py-4 shadow-card backdrop-blur';
const innerClasses = 'layout-container flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between';
const summaryClasses = 'flex items-center justify-between gap-4 font-body text-small text-secondary sm:flex-col sm:items-start sm:gap-1';
const valueClasses = 'font-body text-body font-medium text-primary';

export function OrderSummaryBar({
  totalItems,
  subtotal,
  selectedDateLabel,
  selectedTime,
  continueLabel = 'Continue to Pickup',
  onContinue,
}: OrderSummaryBarProps) {
  return (
    <aside className={wrapperClasses} aria-label="Order summary">
      <div className={innerClasses}>
        <div className={summaryClasses}>
          <p>
            Selected items: <span className={valueClasses}>{totalItems}</span>
          </p>
          <p>
            Estimated subtotal: <span className={valueClasses}>${subtotal}</span>
          </p>
          {selectedDateLabel ? (
            <p>
              Pickup date: <span className={valueClasses}>{selectedDateLabel}</span>
            </p>
          ) : null}
          {selectedTime ? (
            <p>
              Pickup time: <span className={valueClasses}>{selectedTime}</span>
            </p>
          ) : null}
        </div>
        <Button fullWidth disabled={totalItems === 0} className="sm:w-auto" onClick={onContinue}>
          {continueLabel}
        </Button>
      </div>
    </aside>
  );
}
