import { useEffect, useId, useRef, useState } from 'react';
import { classNames } from '@/lib/classNames';
import type { PickupSlot } from './types';

type PickupTimeSelectorProps = {
  slots: PickupSlot[];
  selectedTime: string;
  disabled?: boolean;
  onSelectTime: (time: string) => void;
};

const fieldsetClasses = 'grid gap-6';
const legendClasses = 'font-heading text-h3 font-bold text-primary';
const wrapperClasses = 'relative';
const triggerClasses =
  'flex min-h-12 w-full items-center justify-between rounded-lg border border-surfaceBorder bg-background px-4 py-3 font-body text-small transition-colors duration-200 hover:border-button focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button disabled:cursor-not-allowed disabled:opacity-60';
const listClasses =
  'absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-lg border border-surfaceBorder bg-background shadow-card';
const optionClasses =
  'cursor-pointer px-4 py-3 font-body text-small text-primary transition-colors duration-150 hover:bg-background-soft';
const optionSelectedClasses = 'bg-accent/20 font-medium';
const optionHighlightedClasses = 'bg-background-soft';

export function PickupTimeSelector({ slots, selectedTime, disabled = false, onSelectTime }: PickupTimeSelectorProps) {
  const baseId = useId();
  const labelId = `${baseId}-label`;
  const triggerId = `${baseId}-trigger`;
  const listId = `${baseId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const availableSlots = slots.filter((slot) => !slot.reserved);
  const selectedIndex = availableSlots.findIndex((slot) => slot.value === selectedTime);
  const placeholder = disabled ? 'Select a pickup date first' : 'Select a pickup time';

  function openListbox() {
    if (disabled || availableSlots.length === 0) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function closeListbox() {
    setIsOpen(false);
    setHighlightedIndex(null);
    triggerRef.current?.focus();
  }

  function selectIndex(index: number) {
    const slot = availableSlots[index];
    if (!slot) return;
    onSelectTime(slot.value);
    closeListbox();
  }

  function moveHighlight(direction: 'next' | 'previous' | 'first' | 'last') {
    setHighlightedIndex((current) => {
      const nextIndex =
        direction === 'first'
          ? 0
          : direction === 'last'
            ? availableSlots.length - 1
            : direction === 'next'
              ? ((current ?? -1) + 1) % availableSlots.length
              : ((current ?? 0) - 1 + availableSlots.length) % availableSlots.length;
      return nextIndex;
    });
  }

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setHighlightedIndex(null);
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  function handleTriggerKeyDown(event: React.KeyboardEvent<HTMLButtonElement>) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        if (isOpen) {
          if (highlightedIndex !== null) selectIndex(highlightedIndex);
        } else {
          openListbox();
        }
        break;
      case 'ArrowDown':
        event.preventDefault();
        if (!isOpen) {
          openListbox();
        } else {
          moveHighlight('next');
        }
        break;
      case 'ArrowUp':
        event.preventDefault();
        if (!isOpen) {
          openListbox();
          setHighlightedIndex(availableSlots.length - 1);
        } else {
          moveHighlight('previous');
        }
        break;
      case 'Home':
        event.preventDefault();
        if (!isOpen) openListbox();
        moveHighlight('first');
        break;
      case 'End':
        event.preventDefault();
        if (!isOpen) openListbox();
        moveHighlight('last');
        break;
      case 'Escape':
        event.preventDefault();
        closeListbox();
        break;
      case 'Tab':
        if (isOpen) {
          setIsOpen(false);
          setHighlightedIndex(null);
        }
        break;
      default:
        break;
    }
  }

  function handleOptionKeyDown(event: React.KeyboardEvent<HTMLLIElement>, index: number) {
    switch (event.key) {
      case 'Enter':
      case ' ':
        event.preventDefault();
        selectIndex(index);
        break;
      case 'Escape':
        event.preventDefault();
        closeListbox();
        break;
      default:
        break;
    }
  }

  return (
    <fieldset id="pickup-time-selector" className={`${fieldsetClasses} scroll-mt-24`}>
      <legend className="sr-only">Choose your pickup time</legend>

      <div className="mb-3">
        <h2 id={labelId} className={legendClasses}>
          Choose your pickup time
        </h2>
      </div>

      <div ref={containerRef} className={wrapperClasses}>
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-activedescendant={
            isOpen && highlightedIndex !== null ? `${baseId}-option-${highlightedIndex}` : undefined
          }
          aria-labelledby={labelId}
          disabled={disabled}
          onClick={() => (isOpen ? closeListbox() : openListbox())}
          onKeyDown={handleTriggerKeyDown}
          className={triggerClasses}
        >
          <span className={classNames(selectedTime ? 'text-primary' : 'text-secondary')}>
            {selectedIndex >= 0 ? availableSlots[selectedIndex].label : placeholder}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={classNames('ml-2 h-5 w-5 shrink-0 text-primary transition-transform duration-200', isOpen && 'rotate-180')}
          >
            <path
              fillRule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </button>

        {isOpen && (
          <ul
            id={listId}
            role="listbox"
            aria-labelledby={labelId}
            tabIndex={-1}
            className={listClasses}
          >
            {availableSlots.map((slot, index) => {
              const isSelected = selectedTime === slot.value;
              const isHighlighted = highlightedIndex === index;

              return (
                <li
                  key={slot.value}
                  id={`${baseId}-option-${index}`}
                  role="option"
                  aria-selected={isSelected}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onClick={() => selectIndex(index)}
                  onKeyDown={(event) => handleOptionKeyDown(event, index)}
                  tabIndex={-1}
                  className={classNames(
                    optionClasses,
                    isSelected && optionSelectedClasses,
                    isHighlighted && optionHighlightedClasses,
                  )}
                >
                  {slot.label}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </fieldset>
  );
}
