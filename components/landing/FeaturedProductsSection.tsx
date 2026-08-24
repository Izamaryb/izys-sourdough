'use client';

import { useEffect, useState } from 'react';
import { SectionContainer, useScrollReveal } from '@/components/layout';
import { ProductCard } from '@/components/product';
import { Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { fetchFeaturedProducts } from '@/lib/productsApi';
import type { ProductCatalogItem } from '@/lib/products';
import type { CartAvailability } from '@/types/cart';

const headerClasses = 'mx-auto flex max-w-2xl flex-col items-center gap-3 text-center';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const introClasses = 'max-w-xl text-body font-medium text-primary/90';
const gridClasses = 'mt-16 grid gap-16 md:gap-24';

function getCartAvailability(status: ProductCatalogItem['inventoryStatus']): CartAvailability {
  if (status === 'low') {
    return 'low-stock';
  }

  return status;
}

export function FeaturedProductsSection() {
  const cart = useCart();
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    async function load() {
      try {
        const data = await fetchFeaturedProducts();

        if (!isCancelled) {
          setProducts(data);
        }
      } catch {
        // Silently fail — section just won't render products
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    load();

    return () => {
      isCancelled = true;
    };
  }, []);

  if (isLoading || products.length === 0) {
    return null;
  }

  return <FeaturedProductsContent products={products} cart={cart} />;
}

function FeaturedProductsContent({ products, cart }: { products: ProductCatalogItem[]; cart: ReturnType<typeof useCart> }) {
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
        {products.map((product) => {
          const isSoldOut = product.inventoryStatus === 'sold-out';
          const availability = getCartAvailability(product.inventoryStatus);

          return (
            <ProductCard
              key={product.slug}
              name={product.name}
              description={product.description}
              price={`$${product.price}`}
              image={product.image}
              soldOut={isSoldOut}
              quantity={cart.getItemQuantity(product.slug)}
              onCtaClick={() =>
                cart.increaseQuantity({
                  id: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  availability,
                })
              }
              onDecrease={() => cart.decreaseQuantity(product.slug)}
              onIncrease={() =>
                cart.increaseQuantity({
                  id: product.slug,
                  name: product.name,
                  price: product.price,
                  image: product.image,
                  availability,
                })
              }
            />
          );
        })}
      </div>
    </SectionContainer>
  );
}
