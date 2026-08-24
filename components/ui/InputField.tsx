import type { InputHTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type InputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  error?: string;
};

export function InputField({
  className,
  id,
  label,
  error,
  required,
  ...props
}: InputFieldProps) {
  const inputId = id ?? props.name;
  const errorId = error && inputId ? `${inputId}-error` : undefined;

  return (
    <div className="grid gap-2" data-field-error={error ? 'true' : undefined}>
      <label htmlFor={inputId} className="font-body text-small font-medium text-primary">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <input
        id={inputId}
        className={classNames(
          'min-h-12 w-full rounded-lg border border-accent bg-background px-4 py-3 font-body text-small text-primary placeholder:text-secondary focus:border-button focus:outline-none disabled:cursor-not-allowed disabled:opacity-60',
          error && 'border-button',
          className,
        )}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={errorId}
        {...props}
      />
      {error ? (
        <p id={errorId} className="font-body text-small text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
