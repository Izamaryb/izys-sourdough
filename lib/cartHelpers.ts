import type { CartComputedState, CartItem, CartState, CartValidationState } from '@/types/cart';

type StoredCartState = Partial<CartState> & {
  selectedDate?: string | null;
  selectedTime?: string | null;
  selectedPickupDate?: string | null;
  selectedPickupTime?: string | null;
};

export const emptyCartState: CartState = {
  items: [],
  pickupDate: null,
  pickupTime: null,
};

export function calculateCartTotals(state: CartState): CartComputedState {
  return {
    itemCount: state.items.reduce((total, item) => total + item.quantity, 0),
    subtotal: state.items.reduce((total, item) => total + item.quantity * item.price, 0),
    selectedPickupDate: state.pickupDate,
    selectedPickupTime: state.pickupTime,
  };
}

export function getCartValidation(state: CartState): CartValidationState {
  return {
    hasItems: hasItems(state),
    hasPickupDate: hasPickupDate(state),
    hasPickupTime: hasPickupTime(state),
    isReadyForCheckout: isReadyForCheckout(state),
  };
}

export function isInventoryAvailable(item: CartItem) {
  return item.availability !== 'sold-out';
}

export function hasItems(state: CartState) {
  return state.items.length > 0;
}

export function hasPickupDate(state: CartState) {
  return Boolean(state.pickupDate);
}

export function hasPickupTime(state: CartState) {
  return Boolean(state.pickupTime);
}

export function isReadyForCheckout(state: CartState) {
  return hasItems(state) && hasPickupDate(state) && hasPickupTime(state);
}

export function normalizeCartState(state: StoredCartState): CartState {
  const items = (state.items ?? [])
    .map((item) => {
      const stockQuantity = Math.max(item.stockQuantity ?? 0, 0);

      return {
        ...item,
        availability: item.availability ?? 'available',
        stockQuantity,
        quantity: Math.min(Math.max(item.quantity, 0), stockQuantity),
      };
    })
    .filter((item) => item.quantity > 0 && isInventoryAvailable(item));

  return {
    items,
    pickupDate: items.length > 0 ? state.pickupDate ?? state.selectedPickupDate ?? state.selectedDate ?? null : null,
    pickupTime: items.length > 0 ? state.pickupTime ?? state.selectedPickupTime ?? state.selectedTime ?? null : null,
  };
}
