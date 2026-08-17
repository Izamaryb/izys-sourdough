import type { HTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type PageContainerProps = HTMLAttributes<HTMLElement>;

export function PageContainer({ className, ...props }: PageContainerProps) {
  return (
    <main
      className={classNames('min-h-svh bg-background text-primary', className)}
      {...props}
    />
  );
}
