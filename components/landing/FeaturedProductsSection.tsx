'use client';

import { SectionContainer, useScrollReveal } from '@/components/layout';
import { ProductCard } from '@/components/product';
import { Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import type { CartAvailability } from '@/types/cart';

const featuredProducts = [
  {
    id: 'classic-country-loaf',
    name: 'Classic Country Loaf',
    description: 'A naturally leavened sourdough with a crisp crust, tender crumb, and classic tang.',
    price: 12,
    image: '/images/classic-country-loaf.JPG',
    availability: 'available',
  },
  {
    id: 'jalapeno-cheddar-sourdough',
    name: 'Jalapeño Cheddar Sourdough',
    description: 'A savory loaf folded with sharp cheddar and jalapeño for a warm, flavorful bite.',
    price: 15,
    image: '/images/jalapeno-cheddar-sourdough.jpg',
    availability: 'low-stock',
  },
  {
    id: 'cinnamon-raisin-sourdough',
    name: 'Cinnamon Raisin Sourdough',
    description: 'A cozy, lightly sweet sourdough with cinnamon warmth and raisins throughout.',
    price: 16,
    image: '/images/cinnamon-raisin-sourdough.jpg',
    availability: 'sold-out',
    soldOut: true,
  },
] satisfies {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  availability: CartAvailability;
  soldOut?: boolean;
}[];

const headerClasses = 'mx-auto flex max-w-2xl flex-col items-center gap-3 text-center';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const introClasses = 'max-w-xl text-body font-medium text-primary/90';
const gridClasses = 'mt-16 grid gap-16 md:gap-24';

export function FeaturedProductsSection() {
  const cart = useCart();
  const reveal = useScrollReveal();

  return (
    <SectionContainer ref={reveal.ref} className={reveal.className} spacing="lg" aria-labelledby="featured-products-heading">
      <div className={headerClasses}>
        <p className={eyebrowClasses}>Featured breads</p>
        <Heading id="featured-products-heading" level={2}>
          Weekly artisan sourdough
        </Heading>
        <Text className={introClasses}>
          Small-batch loaves made with simple ingredients, slow fermentation, and a focus on fresh local pickup.
        </Text>
      </div>
      <div className={gridClasses}>
        {featuredProducts.map((product) => (
          <ProductCard
            key={product.id}
            name={product.name}
            description={product.description}
            price={`$${product.price}`}
            image={product.image}
            soldOut={product.soldOut}
            quantity={cart.getItemQuantity(product.id)}
            onCtaClick={() =>
              cart.increaseQuantity({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                availability: product.availability,
              })
            }
            onDecrease={() => cart.decreaseQuantity(product.id)}
            onIncrease={() =>
              cart.increaseQuantity({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                availability: product.availability,
              })
            }
          />
        ))}
      </div>
    </SectionContainer>
  );
}
