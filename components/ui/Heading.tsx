import type { HTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type HeadingLevel = 1 | 2 | 3;

type HeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  level?: HeadingLevel;
};

const headingClasses: Record<HeadingLevel, string> = {
  1: 'text-h1',
  2: 'text-h2',
  3: 'text-h3',
};

export function Heading({ level = 2, className, ...props }: HeadingProps) {
  const Component = `h${level}` as const;

  return (
    <Component
      className={classNames('font-heading font-bold text-primary', headingClasses[level], className)}
      {...props}
    />
  );
}
