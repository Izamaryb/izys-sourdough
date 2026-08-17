import { forwardRef, type HTMLAttributes } from 'react';
import { classNames } from '@/lib/classNames';

type SectionContainerProps = HTMLAttributes<HTMLElement> & {
  spacing?: 'sm' | 'md' | 'lg';
  topSpacing?: 'default' | 'spacious';
};

const spacingClasses: Record<NonNullable<SectionContainerProps['spacing']>, string> = {
  sm: 'py-8 md:py-12',
  md: 'py-10 md:py-12',
  lg: 'py-12 md:py-16',
};

const topSpacingClasses: Record<NonNullable<SectionContainerProps['topSpacing']>, string> = {
  default: '',
  spacious: 'pt-16 md:pt-24',
};

export const SectionContainer = forwardRef<HTMLElement, SectionContainerProps>(function SectionContainer(
  { className, spacing = 'md', topSpacing = 'default', ...props },
  ref,
) {
  return (
    <section
      ref={ref}
      className={classNames('layout-container', spacingClasses[spacing], topSpacingClasses[topSpacing], className)}
      {...props}
    />
  );
});
