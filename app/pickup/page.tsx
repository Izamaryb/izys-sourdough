'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { PageContainer, SectionContainer } from '@/components/layout';
import {
  BeforeYouOrder,
  getPickupDateOptions,
  PickupDateSelector,
  PickupTimeSelector,
} from '@/components/pickup';
import type { PickupSlot } from '@/components/pickup/types';
import { Button, Heading, Text } from '@/components/ui';
import { useCart } from '@/hooks/useCart';
import { fetchPickupSlots } from '@/lib/pickupSlotsApi';

const schedulingGridClasses = 'grid gap-6';
const schedulingPanelClasses = 'grid gap-8 rounded-lg border border-surfaceBorder bg-background-soft p-6 shadow-card';
const beforeYouOrderClasses = 'rounded-lg bg-background p-6';

export default function PickupPage() {
  const cart = useCart();
  const { selectedPickupTime, clearPickupTime } = cart;
  const pickupDateOptions = useMemo(() => getPickupDateOptions(), []);
  const [pickupSlots, setPickupSlots] = useState<PickupSlot[]>([]);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [slotsError, setSlotsError] = useState<string | null>(null);

  useEffect(() => {
    if (!cart.selectedPickupDate) {
      setPickupSlots([]);
      setSlotsError(null);
      return;
    }

    let isCancelled = false;

    async function loadSlots() {
      setIsLoadingSlots(true);
      setSlotsError(null);

      try {
        const slots = await fetchPickupSlots(cart.selectedPickupDate as string);

        if (isCancelled) {
          return;
        }

        setPickupSlots(slots);
      } catch (error) {
        if (!isCancelled) {
          setSlotsError(error instanceof Error ? error.message : 'Failed to load pickup slots');
        }
      } finally {
        if (!isCancelled) {
          setIsLoadingSlots(false);
        }
      }
    }

    loadSlots();

    return () => {
      isCancelled = true;
    };
  }, [cart.selectedPickupDate]);

  useEffect(() => {
    if (!selectedPickupTime) {
      return;
    }

    const selectedSlot = pickupSlots.find((slot) => slot.value === selectedPickupTime);

    if (selectedSlot?.reserved) {
      clearPickupTime();
    }
  }, [pickupSlots, selectedPickupTime, clearPickupTime]);

  if (!cart.hasItems) {
    return (
      <PageContainer>
        <SectionContainer spacing="lg" aria-labelledby="pickup-heading">
          <div className="flex max-w-3xl flex-col items-start gap-4">
            <Heading id="pickup-heading" level={1} className="scroll-mt-24">
              Pickup Scheduling
            </Heading>
            <Text className="text-primary/90">
              Your cart is empty. Add a loaf from the menu to schedule a pickup.
            </Text>
            <Link href="/menu">
              <Button className="mt-2">Browse the Menu</Button>
            </Link>
          </div>
        </SectionContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="pickup-heading">
        <div className="grid gap-6">
          <div className="max-w-3xl">
            <Heading id="pickup-heading" level={1} className="scroll-mt-24">
              Pickup Scheduling
            </Heading>
          </div>

          <div className={schedulingGridClasses}>
            <div className="grid gap-10">
              <div className={schedulingPanelClasses}>
                <PickupDateSelector
                  dates={pickupDateOptions}
                  selectedDate={cart.selectedPickupDate ?? ''}
                  onSelectDate={(date) => {
                    cart.setPickupDate(date);
                    if (!date) cart.clearPickupTime();
                  }}
                />
              </div>
              <div className={schedulingPanelClasses}>
                {slotsError ? (
                  <div className="grid gap-3 rounded-lg border border-surfaceBorder bg-background p-4">
                    <Text className="text-primary/90">{slotsError}</Text>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        if (cart.selectedPickupDate) {
                          fetchPickupSlots(cart.selectedPickupDate).then(setPickupSlots).catch((error) => {
                            setSlotsError(
                              error instanceof Error ? error.message : 'Failed to load pickup slots',
                            );
                          });
                        }
                      }}
                    >
                      Try Again
                    </Button>
                  </div>
                ) : (
                  <PickupTimeSelector
                    slots={pickupSlots}
                    selectedTime={cart.selectedPickupTime ?? ''}
                    disabled={!cart.selectedPickupDate || isLoadingSlots}
                    onSelectTime={cart.setPickupTime}
                  />
                )}
              </div>
              <div className={beforeYouOrderClasses}>
                <BeforeYouOrder />
              </div>
            </div>

            <div className="grid gap-6">
              {cart.isReadyForCheckout ? (
                <Link href="/checkout/auth">
                  <Button fullWidth>Continue to Checkout</Button>
                </Link>
              ) : (
                <Button fullWidth disabled>Continue to Checkout</Button>
              )}
            </div>
          </div>
        </div>
      </SectionContainer>
    </PageContainer>
  );
}
