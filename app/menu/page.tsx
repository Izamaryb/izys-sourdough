'use client';

import { useEffect, useState } from 'react';
import { PageContainer, SectionContainer } from '@/components/layout';
import { OrderProductCard, type OrderProduct } from '@/components/order';
import { Button, Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { fetchProducts } from '@/lib/productsApi';
import type { CartAvailability } from '@/types/cart';

const heroClasses = 'flex max-w-3xl flex-col items-start gap-4';
const eyebrowClasses = 'font-body text-small font-medium uppercase tracking-[0.2em] text-secondary';
const descriptionClasses = 'text-body font-medium text-primary/90';
const noticeClasses = 'font-body text-small font-medium text-primary/90';
const gridClasses = 'grid gap-16';
const gridItemClasses = 'min-w-0';

function getCartAvailability(status: OrderProduct['inventoryStatus']): CartAvailability {
  if (status === 'low') {
    return 'low-stock';
  }

  return status;
}

export default function MenuPage() {
  const cart = useCart();
  const [products, setProducts] = useState<OrderProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    async function loadProducts() {
      try {
        setIsLoading(true);
        setError(null);
        const catalog = await fetchProducts();

        if (isCancelled) {
          return;
        }

        setProducts(
          catalog.map((product) => ({
            id: product.slug,
            name: product.name,
            description: product.description,
            price: product.price,
            image: product.image,
            ingredients: product.ingredients,
            allergens: product.allergens,
            inventoryStatus: product.inventoryStatus,
          })),
        );
      } catch (err) {
        if (!isCancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load menu');
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    loadProducts();

    return () => {
      isCancelled = true;
    };
  }, []);

  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="menu-heading">
        <div className={heroClasses}>
          <p className={eyebrowClasses}>Small-batch sourdough</p>
          <Heading id="menu-heading" level={1}>
            Weekly Menu & Ordering
          </Heading>
          <Text className={descriptionClasses}>
            Handcrafted sourdough baked fresh weekly for Wednesday pickup, made in small batches with transparent ingredients and a slow, thoughtful process.
          </Text>
          <p className={noticeClasses}>Limited weekly inventory available</p>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm" aria-label="Available sourdough products">
        {isLoading ? (
          <div className="py-12 text-center">
            <Text className="text-primary/70">Loading this week&apos;s menu...</Text>
          </div>
        ) : error ? (
          <div className="grid gap-4 rounded-lg border border-surfaceBorder bg-background-soft p-6 text-center">
            <Text className="text-primary/90">{error}</Text>
            <Button onClick={() => window.location.reload()}>Try Again</Button>
          </div>
        ) : (
          <div className={gridClasses}>
            {products.map((product) => (
              <div key={product.id} className={gridItemClasses}>
                <OrderProductCard
                  product={product}
                  quantity={cart.getItemQuantity(product.id)}
                  onDecrease={() => cart.decreaseQuantity(product.id)}
                  onIncrease={() =>
                    cart.increaseQuantity({
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      image: product.image,
                      availability: getCartAvailability(product.inventoryStatus),
                    })
                  }
                />
              </div>
            ))}
          </div>
        )}
      </SectionContainer>
    </PageContainer>
  );
}
