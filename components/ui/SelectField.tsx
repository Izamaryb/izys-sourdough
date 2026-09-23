import { useEffect, useId, useRef, useState } from 'react';
import { classNames } from '@/lib/classNames';

type SelectFieldProps = {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  id?: string;
  name?: string;
};

const wrapperClasses = 'grid gap-2';
const triggerClasses =
  'flex min-h-12 w-full items-center justify-between rounded-lg border border-accent bg-background px-4 py-3 pr-10 font-body text-small text-primary transition-colors hover:border-button focus:border-button focus:outline-none focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button disabled:cursor-not-allowed disabled:opacity-60';
const listClasses =
  'absolute left-0 right-0 top-full z-50 mt-2 max-h-64 overflow-auto rounded-lg border border-surfaceBorder bg-background shadow-card';
const optionClasses =
  'cursor-pointer px-4 py-3 font-body text-small text-primary transition-colors duration-150 hover:bg-background-soft';
const optionSelectedClasses = 'bg-accent/20 font-medium';
const optionHighlightedClasses = 'bg-background-soft';

export function SelectField({
  label,
  value,
  options,
  onChange,
  error,
  required,
  disabled,
  className,
  id,
  name,
}: SelectFieldProps) {
  const baseId = useId();
  const selectId = id ?? `${baseId}-select`;
  const labelId = `${selectId}-label`;
  const triggerId = `${selectId}-trigger`;
  const listId = `${selectId}-listbox`;

  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  const selectedIndex = options.findIndex((option) => option.value === value);
  const selectedLabel = options[selectedIndex]?.label ?? '';

  function openListbox() {
    if (disabled || options.length === 0) return;
    setHighlightedIndex(selectedIndex >= 0 ? selectedIndex : 0);
    setIsOpen(true);
  }

  function closeListbox() {
    setIsOpen(false);
    setHighlightedIndex(null);
    triggerRef.current?.focus();
  }

  function selectIndex(index: number) {
    const option = options[index];
    if (!option) return;
    onChange(option.value);
    closeListbox();
  }

  function moveHighlight(direction: 'next' | 'previous' | 'first' | 'last') {
    setHighlightedIndex((current) => {
      const nextIndex =
        direction === 'first'
          ? 0
          : direction === 'last'
            ? options.length - 1
            : direction === 'next'
              ? ((current ?? -1) + 1) % options.length
              : ((current ?? 0) - 1 + options.length) % options.length;
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
          setHighlightedIndex(options.length - 1);
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
    <div className={classNames(wrapperClasses, className)}>
      <label id={labelId} htmlFor={triggerId} className="font-body text-small font-medium text-primary">
        {label}
        {required ? <span aria-hidden="true"> *</span> : null}
      </label>
      <div ref={containerRef} className="relative">
        <button
          ref={triggerRef}
          id={triggerId}
          type="button"
          role="combobox"
          aria-haspopup="listbox"
          aria-controls={listId}
          aria-expanded={isOpen}
          aria-activedescendant={
            isOpen && highlightedIndex !== null ? `${selectId}-option-${highlightedIndex}` : undefined
          }
          aria-labelledby={labelId}
          disabled={disabled}
          onClick={() => (isOpen ? closeListbox() : openListbox())}
          onKeyDown={handleTriggerKeyDown}
          className={classNames(triggerClasses, error && 'border-button')}
        >
          <span className={classNames(selectedLabel ? 'text-primary' : 'text-secondary')}>
            {selectedLabel || 'Select...'}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
            className={classNames(
              'ml-2 h-5 w-5 shrink-0 text-primary transition-transform duration-200',
              isOpen && 'rotate-180',
            )}
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
            {options.map((option, index) => {
              const isSelected = value === option.value;
              const isHighlighted = highlightedIndex === index;

              return (
                <li
                  key={option.value}
                  id={`${selectId}-option-${index}`}
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
                  {option.label}
                </li>
              );
            })}
          </ul>
        )}

        {name ? (
          <select
            name={name}
            value={value}
            required={required}
            disabled={disabled}
            onChange={(e) => onChange(e.target.value)}
            className="sr-only"
            aria-hidden="true"
            tabIndex={-1}
          >
            <option value="">{required ? '' : 'Select...'}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : null}
      </div>
      {error ? (
        <p id={`${selectId}-error`} className="font-body text-small text-primary">
          {error}
        </p>
      ) : null}
    </div>
  );
}
