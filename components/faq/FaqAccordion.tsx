'use client';

import { useState } from 'react';
import { classNames } from '@/lib/classNames';

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionProps = {
  items: FaqItem[];
};

const listClasses = 'grid gap-3';
const itemClasses = 'rounded-lg border border-surfaceBorder bg-background shadow-card';
const buttonClasses = 'flex min-h-14 w-full items-center justify-between gap-4 rounded-lg px-5 py-4 text-left font-body text-body font-medium text-primary transition-colors duration-200 hover:bg-accent/10 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const iconClasses = 'flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-surfaceBorder bg-accent/10 font-body text-body text-primary transition-transform duration-200';
const panelClasses = 'grid overflow-hidden transition-[grid-template-rows] duration-200 ease-in-out';
const panelInnerClasses = 'overflow-hidden px-5';
const answerClasses = 'border-t border-surfaceBorder pb-5 pt-4 font-body text-small leading-relaxed text-primary/90';

export function FaqAccordion({ items }: FaqAccordionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  function toggleItem(index: number) {
    setOpenIndex((currentIndex) => (currentIndex === index ? null : index));
  }

  return (
    <div className={listClasses}>
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        const buttonId = `faq-question-${index}`;
        const panelId = `faq-answer-${index}`;

        return (
          <article key={item.question} className={itemClasses}>
            <h2>
              <button
                id={buttonId}
                type="button"
                className={buttonClasses}
                onClick={() => toggleItem(index)}
                aria-expanded={isOpen}
                aria-controls={panelId}
              >
                <span>{item.question}</span>
                <span className={classNames(iconClasses, isOpen && 'rotate-45')} aria-hidden="true">
                  +
                </span>
              </button>
            </h2>
            <div
              id={panelId}
              role="region"
              aria-labelledby={buttonId}
              className={classNames(panelClasses, isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]')}
            >
              <div className={panelInnerClasses}>
                <p className={answerClasses}>{item.answer}</p>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
