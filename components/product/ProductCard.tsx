import { useEffect, useRef, useState } from 'react';
import { QuantitySelector } from '@/components/order';
import { Button, CheckIcon, Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { classNames } from '@/lib/classNames';
import { ImageCarousel } from './ImageCarousel';

type ProductCardProps = {
  name: string;
  description: string;
  price: string;
  image: string;
  ingredientHighlights?: string[];
  ctaLabel?: string;
  onCtaClick?: () => void;
  soldOut?: boolean;
  quantity?: number;
  onDecrease?: () => void;
  onIncrease?: () => void;
};

const cardClasses = 'grid gap-8 md:gap-12';
const imageWrapClasses =
  'relative -mx-4 aspect-[5/4] overflow-hidden bg-accent/20 sm:aspect-[4/3] md:mx-auto md:aspect-[16/10] md:w-full md:max-w-[900px] lg:max-w-[1040px]';
const imageClasses = 'object-cover object-center';
const contentClasses = 'mx-auto flex w-full max-w-[720px] flex-col gap-4';
const badgeClasses = 'absolute inset-0 flex items-center justify-center bg-primary/60 font-body text-xl font-medium uppercase tracking-[0.18em] text-button-text [text-shadow:0_1px_3px_rgb(0_0_0_/_0.45)]';
const priceClasses = 'font-body text-body font-medium text-primary';
const actionsClasses = 'min-h-[4.5rem] transition-all duration-200';
const buttonLabelClasses = 'transition-opacity duration-150 ease-in-out motion-reduce:transition-none';

export function ProductCard({
  name,
  description,
  price,
  image,
  ingredientHighlights,
  ctaLabel = 'Order This Loaf',
  onCtaClick,
  soldOut = false,
  quantity = 0,
  onDecrease,
  onIncrease,
}: ProductCardProps) {
  const cart = useCart();
  const addButtonRef = useRef<HTMLButtonElement>(null);
  const [showAddedState, setShowAddedState] = useState(false);
  const [isButtonLabelVisible, setIsButtonLabelVisible] = useState(true);

  useEffect(() => {
    if (!showAddedState) {
      return;
    }

    const fadeOutTimeoutId = window.setTimeout(() => {
      setIsButtonLabelVisible(false);
    }, 1200);

    const resetTimeoutId = window.setTimeout(() => {
      setShowAddedState(false);
      setIsButtonLabelVisible(true);
    }, 1350);

    return () => {
      window.clearTimeout(fadeOutTimeoutId);
      window.clearTimeout(resetTimeoutId);
    };
  }, [showAddedState]);

  function handleCtaClick() {
    if (showAddedState || !isButtonLabelVisible) {
      return;
    }

    onCtaClick?.();
    cart.triggerAddToCartAnimation(addButtonRef.current, image);

    if (onDecrease && onIncrease) {
      setShowAddedState(true);
    } else {
      setIsButtonLabelVisible(false);
      window.setTimeout(() => {
        setShowAddedState(true);
        setIsButtonLabelVisible(true);
      }, 150);
    }
  }

  return (
    <article className={cardClasses}>
      <ImageCarousel
        image={image}
        alt={name}
        wrapClassName={imageWrapClasses}
        imageClassName={classNames(imageClasses, soldOut && 'opacity-70')}
        overlay={soldOut ? <div className={badgeClasses}>Sold Out</div> : null}
      />
      <div className={contentClasses}>
        <div className="grid gap-2">
          <Heading level={3}>{name}</Heading>
          <Text size="small" className="text-primary/90">
            {description}
          </Text>
          {ingredientHighlights ? (
            <p className="font-body text-small font-medium text-primary">
              {ingredientHighlights.join(' • ')}
            </p>
          ) : null}
        </div>
        <div className="mt-auto flex flex-col gap-4">
          <p className={priceClasses}>{price}</p>
          <div className={actionsClasses}>
            {showAddedState ? (
              <div className="flex min-h-12 w-full items-center justify-center gap-2 rounded-lg border border-button bg-accent/10 px-6 py-3 font-body text-cta text-primary transition-colors duration-200" role="status" aria-live="polite">
                <CheckIcon className="h-4 w-4" /> Added
              </div>
            ) : quantity > 0 && onDecrease && onIncrease ? (
              <QuantitySelector
                productName={name}
                quantity={quantity}
                disabled={soldOut}
                onDecrease={onDecrease}
                onIncrease={onIncrease}
              />
            ) : (
              <Button ref={addButtonRef} fullWidth disabled={soldOut} onClick={handleCtaClick} className="overflow-hidden">
                <span
                  className={classNames(buttonLabelClasses, isButtonLabelVisible ? 'opacity-100' : 'opacity-0')}
                >
                  {soldOut ? 'Sold Out' : ctaLabel}
                </span>
              </Button>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
