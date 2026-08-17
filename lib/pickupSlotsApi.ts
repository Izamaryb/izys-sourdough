import type { PickupSlot } from '@/components/pickup/types';

export type PickupSlotWithAvailability = PickupSlot & {
  capacity: number;
  orderCount: number;
};

export type PickupSlotsApiResponse = {
  slots: PickupSlotWithAvailability[];
};

export type ApiErrorResponse = {
  error: string;
};

export async function fetchPickupSlots(date: string): Promise<PickupSlotWithAvailability[]> {
  const response = await fetch(`/api/pickup-slots?date=${encodeURIComponent(date)}`, {
    cache: 'no-store',
  });
  const data = (await response.json()) as PickupSlotsApiResponse | ApiErrorResponse;

  if (!response.ok || !('slots' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load pickup slots';
    throw new Error(message);
  }

  return data.slots;
}
