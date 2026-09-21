import type { RefObject } from 'react';

export type CartAvailability = 'available' | 'low-stock' | 'sold-out';

export type CartFlyoverItem = {
  key: number;
  image: string;
  startRect: { left: number; top: number; width: number; height: number };
};

export type CartItemInput = {
  id: string;
  name: string;
  price: number;
  image: string;
  availability: CartAvailability;
  stockQuantity: number;
};

export type CartItem = CartItemInput & {
  quantity: number;
};

export type CheckoutCustomerData = {
  name?: string;
  email?: string;
  phone?: string;
};

export type CartState = {
  items: CartItem[];
  pickupDate: string | null;
  pickupTime: string | null;
};

export type CartComputedState = {
  itemCount: number;
  subtotal: number;
  selectedPickupDate: string | null;
  selectedPickupTime: string | null;
};

export type CartValidationState = {
  hasItems: boolean;
  hasPickupDate: boolean;
  hasPickupTime: boolean;
  isReadyForCheckout: boolean;
};

export type CartContextValue = CartState &
  CartComputedState &
  CartValidationState & {
    isCartDrawerOpen: boolean;
    openCartDrawer: () => void;
    closeCartDrawer: () => void;
    cartIconRef: RefObject<HTMLButtonElement>;
    flyover: CartFlyoverItem | null;
    triggerAddToCartAnimation: (sourceElement: HTMLElement | null, image: string) => void;
    clearAddToCartAnimation: () => void;
    addItem: (item: CartItemInput) => void;
    removeItem: (itemId: string) => void;
    increaseQuantity: (item: CartItemInput) => void;
    decreaseQuantity: (productId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearItem: (itemId: string) => void;
    clearCart: () => void;
    setPickupDate: (pickupDate: string) => void;
    clearPickupDate: () => void;
    setPickupTime: (pickupTime: string) => void;
    clearPickupTime: () => void;
    getItemQuantity: (productId: string) => number;
  };
