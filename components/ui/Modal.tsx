'use client';

import { useEffect, useRef } from 'react';
import { Heading } from '@/components/ui';
import { classNames } from '@/lib/classNames';

type ModalProps = {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

const overlayClasses =
  'fixed inset-0 z-40 bg-black/50 transition-opacity duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';
const panelClasses =
  'fixed left-1/2 top-1/2 z-50 w-[calc(100%-32px)] max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-lg border border-surfaceBorder bg-background p-6 shadow-card transition-[transform,opacity] duration-[400ms] [transition-timing-function:cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none';
const headerClasses = 'flex items-start justify-between gap-4';
const closeButtonClasses =
  'flex min-h-10 min-w-10 items-center justify-center rounded-lg text-primary transition-colors duration-200 hover:bg-accent/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';

export function Modal({ isOpen, onClose, title, children, ariaLabel }: ModalProps) {
  const originalBodyStyles = useRef<{ overflow: string; paddingRight: string } | null>(null);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;

    if (originalBodyStyles.current === null) {
      originalBodyStyles.current = {
        overflow: document.body.style.overflow,
        paddingRight: document.body.style.paddingRight,
      };
    }

    document.body.style.overflow = 'hidden';
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);

      if (originalBodyStyles.current !== null) {
        document.body.style.overflow = originalBodyStyles.current.overflow;
        document.body.style.paddingRight = originalBodyStyles.current.paddingRight;
        originalBodyStyles.current = null;
      }
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div role="presentation" className="fixed inset-0 z-50">
      <div
        className={classNames(overlayClasses, isOpen ? 'opacity-100' : 'opacity-0')}
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className={classNames(panelClasses, isOpen ? 'scale-100 opacity-100' : 'scale-95 opacity-0')}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel ?? title}
      >
        <div className={headerClasses}>
          <Heading level={3}>{title}</Heading>
          <button
            type="button"
            onClick={onClose}
            className={closeButtonClasses}
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}
