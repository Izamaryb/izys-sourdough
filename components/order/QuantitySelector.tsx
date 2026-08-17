type QuantitySelectorProps = {
  productName: string;
  quantity: number;
  disabled?: boolean;
  onDecrease: () => void;
  onIncrease: () => void;
};

const wrapperClasses = 'flex w-full items-center justify-between gap-3 rounded-lg border border-surfaceBorder bg-background px-3 py-2 transition-colors duration-200';
const buttonClasses = 'flex min-h-12 min-w-12 items-center justify-center rounded-lg border border-surfaceBorder bg-accent/10 font-body text-body font-medium text-primary transition-colors duration-200 hover:border-button hover:bg-button hover:text-button-text disabled:cursor-not-allowed disabled:opacity-40';
const valueClasses = 'min-w-10 text-center font-body text-body font-medium text-primary';

export function QuantitySelector({
  productName,
  quantity,
  disabled = false,
  onDecrease,
  onIncrease,
}: QuantitySelectorProps) {
  return (
    <div className={wrapperClasses} aria-label={`${productName} quantity selector`}>
      <button
        type="button"
        className={buttonClasses}
        onClick={onDecrease}
        disabled={disabled || quantity === 0}
        aria-label={`Decrease ${productName} quantity`}
      >
        −
      </button>
      <span className={valueClasses} aria-live="polite" aria-label={`${quantity} selected`}>
        {quantity}
      </span>
      <button
        type="button"
        className={buttonClasses}
        onClick={onIncrease}
        disabled={disabled}
        aria-label={`Increase ${productName} quantity`}
      >
        +
      </button>
    </div>
  );
}
