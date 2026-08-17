'use client';

import { useState } from 'react';
import { Modal, Text } from '@/components/ui';

type ProductAllergenInfoProps = {
  ingredients: string[];
  allergens: string[];
};

const triggerClasses =
  'w-fit font-body text-small font-medium text-secondary underline underline-offset-4 transition-colors duration-200 hover:text-primary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const sectionClasses = 'grid gap-1';
const labelClasses = 'font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';

export function ProductAllergenInfo({ ingredients, allergens }: ProductAllergenInfoProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        className={triggerClasses}
        onClick={() => setIsOpen(true)}
        aria-haspopup="dialog"
      >
        Ingredients & Allergens
      </button>
      <Modal isOpen={isOpen} onClose={() => setIsOpen(false)} title="Ingredients & Allergens">
        <div className="grid gap-4">
          <div className={sectionClasses}>
            <p className={labelClasses}>Ingredients</p>
            <Text>{ingredients.join(', ')}</Text>
          </div>
          <div className={sectionClasses}>
            <p className={labelClasses}>Allergens</p>
            <Text>Contains: {allergens.join(', ')}</Text>
          </div>
          <Text size="small" className="text-primary/90">
            Made in a home kitchen operating under Florida cottage food law.
          </Text>
        </div>
      </Modal>
    </>
  );
}
