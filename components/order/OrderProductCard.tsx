import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import { Button, CheckIcon, Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { classNames } from '@/lib/classNames';
import type { InventoryStatus } from './InventoryBadge';
import { ProductAllergenInfo } from './ProductAllergenInfo';
import { QuantitySelector } from './QuantitySelector';

export type OrderProduct = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  allergens: string[];
  inventoryStatus: InventoryStatus;
};

type OrderProductCardProps = {
  product: OrderProduct;
  quantity: number;
  onDecrease: () => void;
  onIncrease: () => void;
};

const cardClasses = 'grid gap-8 md:gap-12';
const imageWrapClasses =
  'relative -mx-4 aspect-[5/4] overflow-hidden bg-accent/20 sm:aspect-[4/3] md:mx-auto md:aspect-[16/10] md:w-full md:max-w-[900px] lg:max-w-[1040px]';
const imageClasses = 'object-cover object-center';
const soldOutOverlayClasses ='absolute inset-0 flex items-center justify-center bg-primary/60 font-body text-xl font-medium uppercase tracking-[0.18em] text-button-text [text-shadow:0_1px_3px_rgb(0_0_0_/_0.45)]';const contentClasses = 'mx-auto grid w-full max-w-[720px] gap-4';
const copyClasses = 'grid content-start gap-3';
const priceClasses = 'font-body text-body font-medium text-primary';
const actionsClasses = 'min-h-[4.5rem] transition-all duration-200';
const addedClasses = 'flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-button bg-accent/10 px-6 py-3 font-body text-cta text-primary transition-colors duration-200';

export function OrderProductCard({ product, quantity, onDecrease, onIncrease }: OrderProductCardProps) {
  const cart = useCart();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const isSoldOut = product.inventoryStatus === 'sold-out';
  const [showAddedState, setShowAddedState] = useState(false);

  useEffect(() => {
    if (!showAddedState) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setShowAddedState(false);
    }, 400);

    return () => window.clearTimeout(timeoutId);
  }, [showAddedState]);

  function handleAddToOrder() {
    setShowAddedState(true);
    onIncrease();
    cart.triggerAddToCartAnimation(addButtonRef.current, product.image);
  }

  return (
    <article className={cardClasses}>
      <div className={imageWrapClasses}>
        <Image
          src={product.image}
          alt={product.name}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 900px, 1040px"
          className={classNames(imageClasses, isSoldOut && 'opacity-70')}
        />
        {isSoldOut ? <div className={soldOutOverlayClasses}>Sold Out</div> : null}
      </div>
      <div className={contentClasses}>
        <div className={copyClasses}>
          <div className="flex items-start justify-between gap-4">
            <Heading level={3}>{product.name}</Heading>
            <p className={priceClasses}>${product.price}</p>
          </div>
          <Text size="small" className="text-primary/90">
            {product.description}
          </Text>
        </div>

        <div className={actionsClasses}>
          {showAddedState ? (
            <div className={addedClasses} role="status" aria-live="polite">
              <CheckIcon className="h-4 w-4" /> Added
            </div>
          ) : quantity > 0 ? (
            <QuantitySelector
              productName={product.name}
              quantity={quantity}
              disabled={isSoldOut}
              onDecrease={onDecrease}
              onIncrease={onIncrease}
            />
          ) : (
            <Button ref={addButtonRef} fullWidth disabled={isSoldOut} onClick={handleAddToOrder} className="min-h-14 py-4">
              Add to Order
            </Button>
          )}
        </div>

        <ProductAllergenInfo ingredients={product.ingredients} allergens={product.allergens} />
      </div>
    </article>
  );
}
