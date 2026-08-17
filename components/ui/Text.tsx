import type { HTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type TextSize = 'body' | 'small';

type TextProps = HTMLAttributes<HTMLParagraphElement> & {
  size?: TextSize;
  muted?: boolean;
};

const textSizeClasses: Record<TextSize, string> = {
  body: 'text-body',
  small: 'text-small',
};

export function Text({
  className,
  size = 'body',
  muted = false,
  ...props
}: TextProps) {
  return (
    <p
      className={classNames(
        'font-body',
        textSizeClasses[size],
        muted ? 'text-secondary' : 'text-primary',
        className,
      )}
      {...props}
    />
  );
}
