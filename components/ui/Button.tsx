import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type ButtonVariant = 'primary' | 'secondary';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  fullWidth?: boolean;
};

const buttonVariants: Record<ButtonVariant, string> = {
  primary: 'border-button bg-button text-button-text shadow-card hover:border-button-hover hover:bg-button-hover',
  secondary: 'border-button bg-transparent text-primary hover:bg-button hover:text-button-text',
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'primary', fullWidth = false, type = 'button', disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      className={classNames(
        'inline-flex min-h-12 items-center justify-center rounded-lg border px-6 py-3 font-body text-cta transition-colors duration-200 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button disabled:cursor-not-allowed disabled:opacity-60',
        buttonVariants[variant],
        fullWidth && 'w-full',
        className,
      )}
      type={type}
      disabled={disabled}
      {...props}
    />
  );
});
