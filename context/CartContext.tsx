'use client';

import { createContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { clearStoredCheckoutForm } from '@/lib/checkoutStorage';
import { calculateCartTotals, emptyCartState, getCartValidation, normalizeCartState } from '@/lib/cartHelpers';
import type { CartContextValue, CartFlyoverItem, CartItemInput, CartState } from '@/types/cart';

const CART_STORAGE_KEY = 'izys-sourdough-cart';

export const CartContext = createContext<CartContextValue | null>(null);

type CartProviderProps = {
  children: ReactNode;
};

function readStoredCart(): CartState {
  if (typeof window === 'undefined') {
    return emptyCartState;
  }

  try {
    const storedCart = window.localStorage.getItem(CART_STORAGE_KEY);

    if (!storedCart) {
      return emptyCartState;
    }

    return normalizeCartState({
      ...emptyCartState,
      ...JSON.parse(storedCart),
    });
  } catch {
    return emptyCartState;
  }
}

export function CartProvider({ children }: CartProviderProps) {
  const [cartState, setCartState] = useState<CartState>(emptyCartState);
  const [hasHydrated, setHasHydrated] = useState(false);
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
  const [isPlacingOrder, setIsPlacingOrder] = useState(false);
  const [flyover, setFlyover] = useState<CartFlyoverItem | null>(null);
  const cartIconRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setCartState(readStoredCart());
    setHasHydrated(true);
  }, []);

  useEffect(() => {
    if (!hasHydrated) {
      return;
    }

    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartState));
  }, [cartState, hasHydrated]);

  const contextValue = useMemo<CartContextValue>(() => {
    function addItem(item: CartItemInput) {
      increaseQuantity(item);
    }

    function removeItem(itemId: string) {
      clearItem(itemId);
    }

    function increaseQuantity(item: CartItemInput) {
      if (item.availability === 'sold-out' || item.stockQuantity <= 0) {
        return;
      }

      setCartState((currentState) => {
        const existingItem = currentState.items.find((cartItem) => cartItem.id === item.id);

        if (existingItem) {
          if (existingItem.quantity >= item.stockQuantity) {
            return currentState;
          }

          return {
            ...currentState,
            items: currentState.items.map((cartItem) =>
              cartItem.id === item.id
                ? { ...cartItem, stockQuantity: item.stockQuantity, quantity: cartItem.quantity + 1 }
                : cartItem,
            ),
          };
        }

        return {
          ...currentState,
          items: [...currentState.items, { ...item, quantity: 1 }],
        };
      });
    }

    function decreaseQuantity(itemId: string) {
      setCartState((currentState) => ({
        ...currentState,
        items: currentState.items
          .map((item) => (item.id === itemId ? { ...item, quantity: Math.max(item.quantity - 1, 0) } : item))
          .filter((item) => item.quantity > 0),
      }));
    }

    function updateQuantity(itemId: string, quantity: number) {
      const requestedQuantity = Math.max(Math.floor(quantity), 0);

      setCartState((currentState) => ({
        ...currentState,
        items: currentState.items
          .map((item) =>
            item.id === itemId
              ? { ...item, quantity: Math.min(requestedQuantity, item.stockQuantity) }
              : item,
          )
          .filter((item) => item.quantity > 0),
      }));
    }

    function clearItem(itemId: string) {
      setCartState((currentState) => ({
        ...currentState,
        items: currentState.items.filter((item) => item.id !== itemId),
      }));
    }

    function clearCart() {
      clearStoredCheckoutForm();

      setCartState(emptyCartState);
    }

    function setPickupDate(pickupDate: string) {
      setCartState((currentState) => ({
        ...currentState,
        pickupDate,
        pickupTime: null,
      }));
    }

    function clearPickupDate() {
      setCartState((currentState) => ({
        ...currentState,
        pickupDate: null,
        pickupTime: null,
      }));
    }

    function setPickupTime(pickupTime: string) {
      setCartState((currentState) => ({
        ...currentState,
        pickupTime,
      }));
    }

    function clearPickupTime() {
      setCartState((currentState) => ({
        ...currentState,
        pickupTime: null,
      }));
    }

    function getItemQuantity(productId: string) {
      return cartState.items.find((item) => item.id === productId)?.quantity ?? 0;
    }

    function openCartDrawer() {
      setIsCartDrawerOpen(true);
    }

    function closeCartDrawer() {
      setIsCartDrawerOpen(false);
    }

    function triggerAddToCartAnimation(sourceElement: HTMLElement | null, image: string) {
      if (!sourceElement) {
        return;
      }

      const rect = sourceElement.getBoundingClientRect();

      setFlyover({
        key: Date.now(),
        image,
        startRect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height },
      });
    }

    function clearAddToCartAnimation() {
      setFlyover(null);
    }

    return {
      ...cartState,
      ...calculateCartTotals(cartState),
      ...getCartValidation(cartState),
      isCartDrawerOpen,
      isPlacingOrder,
      setIsPlacingOrder,
      openCartDrawer,
      closeCartDrawer,
      cartIconRef,
      flyover,
      triggerAddToCartAnimation,
      clearAddToCartAnimation,
      addItem,
      removeItem,
      increaseQuantity,
      decreaseQuantity,
      updateQuantity,
      clearItem,
      clearCart,
      setPickupDate,
      clearPickupDate,
      setPickupTime,
      clearPickupTime,
      getItemQuantity,
    };
  }, [cartState, isCartDrawerOpen, isPlacingOrder, flyover]);

  return <CartContext.Provider value={contextValue}>{children}</CartContext.Provider>;
}
