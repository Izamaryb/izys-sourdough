import type { SelectHTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type SelectFieldProps = SelectHTMLAttributes<HTMLSelectElement> & {
  label: string;
  error?: string;
  options: Array<{ value: string; label: string }>;
};

export function SelectField({
  className,
  id,
  label,
  error,
  options,
  required,
  ...props
}: SelectFieldProps) {
  const selectId = id ?? props.name;
  const errorId = error && selectId ? `${selectId}-error` : undefined;

  return (
    <div className="grid gap-2">
      <label htmlFor={selectId} className="font-body text-small font-medium text-primary">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <select
        id={selectId}
        className={classNames(
          'min-h-12 w-full rounded-lg border border-accent bg-background px-4 py-3 font-body text-small text-primary focus:border-button focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-button',
          className,
        )}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error ? (
        <p id={errorId} className="font-body text-small text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
