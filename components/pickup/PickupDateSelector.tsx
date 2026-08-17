import { CheckIcon } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import type { PickupDateOption } from './types';

type PickupDateSelectorProps = {
  dates: PickupDateOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
};

const fieldsetClasses = 'grid gap-6';
const legendClasses = 'font-heading text-h3 font-bold text-primary';
const gridClasses = 'grid gap-4 sm:grid-cols-2';
const optionClasses = 'relative rounded-lg border p-4 text-left transition-all duration-200 focus-within:outline focus-within:outline-[3px] focus-within:outline-offset-4 focus-within:outline-button';
const availableClasses = 'border-surfaceBorder bg-background hover:border-button hover:shadow-sm';
const selectedClasses = 'border-button bg-accent/20 shadow-sm';
const disabledClasses = 'border-surfaceBorder bg-background-soft opacity-60';
const labelClasses = 'block font-body text-body font-medium text-primary';
const helperClasses = 'mt-1 block font-body text-small text-secondary';
const selectedIndicatorClasses = 'absolute right-3 top-3 flex h-6 w-6 items-center justify-center rounded-full bg-button text-button-text';

export function PickupDateSelector({ dates, selectedDate, onSelectDate }: PickupDateSelectorProps) {
  return (
    <fieldset id="pickup-date-selector" className={`${fieldsetClasses} scroll-mt-24`}>
      <legend className="sr-only">Choose your pickup date</legend>

      <div className="mb-3">
        <h2 className={legendClasses}>Choose your pickup date</h2>
      </div>

      <div className={gridClasses}>
        {dates.map((date) => {
          const isDisabled = date.status !== 'available';
          const isSelected = selectedDate === date.value;

          return (
            <label
              key={date.value}
              className={classNames(
                optionClasses,
                isDisabled ? disabledClasses : availableClasses,
                isSelected && selectedClasses,
              )}
            >
              <input
                type="radio"
                name="pickup-date"
                value={date.value}
                checked={isSelected}
                disabled={isDisabled}
                onChange={() => {}}
                onClick={() => onSelectDate(isSelected ? '' : date.value)}
                className="sr-only focus:outline-none focus-visible:outline-none"
              />
              <span className={labelClasses}>{date.label}</span>
              <span className={helperClasses}>{date.helperText}</span>
              {isSelected && (
                <span className={selectedIndicatorClasses} aria-hidden="true">
                  <CheckIcon className="h-4 w-4" />
                </span>
              )}
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
