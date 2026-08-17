import type { CartItem } from './cart';

export type PaymentMethod = 'venmo' | 'cash-app' | 'cash';

export type CheckoutCustomer = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  marketingOptIn?: boolean;
  smsOptIn?: boolean;
  paymentMethod?: PaymentMethod | null;
};

export type CheckoutOptIns = {
  marketingOptIn: boolean;
  smsOptIn: boolean;
};

export type CheckoutFormState = {
  customer: CheckoutCustomer;
  paymentMethod: PaymentMethod | '';
  optIns: CheckoutOptIns;
  createAccount: boolean;
};

export type CheckoutValidationInput = CheckoutFormState & {
  hasItems: boolean;
  hasPickupDate: boolean;
  hasPickupTime: boolean;
};

export type CheckoutValidationErrors = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  paymentMethod?: string;
  cart?: string;
  pickup?: string;
};

export type CheckoutValidationResult = {
  errors: CheckoutValidationErrors;
  isValid: boolean;
};

export type PreparedOrder = {
  customer: CheckoutCustomer;
  items: CartItem[];
  pickupDate: string;
  pickupTime: string;
  paymentMethod: PaymentMethod;
  marketingOptIn: boolean;
  smsOptIn: boolean;
  subtotal: number;
};
