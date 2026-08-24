import type { CheckoutCustomer, CheckoutFormState, PaymentMethod } from '@/types/checkout';

export const CHECKOUT_FORM_STORAGE_KEY = 'izys-sourdough-checkout-form';
export const ACCOUNT_STORAGE_KEY = 'izys-sourdough-account';
export const ACCOUNT_EMAIL_STORAGE_KEY = 'izys-sourdough-account-email';

const validPaymentMethods: PaymentMethod[] = ['venmo', 'cash-app', 'cash'];

export function readStoredCheckoutForm(): CheckoutFormState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.sessionStorage.getItem(CHECKOUT_FORM_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      customer: {
        firstName: String(parsed.customer?.firstName ?? ''),
        lastName: String(parsed.customer?.lastName ?? ''),
        email: String(parsed.customer?.email ?? ''),
        phone: String(parsed.customer?.phone ?? ''),
      },
      paymentMethod: validPaymentMethods.includes(parsed.paymentMethod) ? parsed.paymentMethod : '',
      optIns: {
        marketingOptIn: Boolean(parsed.optIns?.marketingOptIn),
        smsOptIn: Boolean(parsed.optIns?.smsOptIn),
      },
      createAccount: Boolean(parsed.createAccount),
      accountPassword: String(parsed.accountPassword ?? ''),
      confirmAccountPassword: String(parsed.confirmAccountPassword ?? ''),
    };
  } catch {
    return null;
  }
}

export function hasStoredCheckoutCustomerInfo(): boolean {
  const stored = readStoredCheckoutForm();

  if (!stored) {
    return false;
  }

  return Boolean(
    stored.customer.firstName.trim() &&
      stored.customer.lastName.trim() &&
      stored.customer.phone.trim(),
  );
}

export function clearStoredCheckoutForm(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
}

export function readStoredAccountCustomer(): CheckoutCustomer | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const stored = window.localStorage.getItem(ACCOUNT_STORAGE_KEY);

    if (!stored) {
      return null;
    }

    const parsed = JSON.parse(stored);

    if (!parsed || typeof parsed !== 'object') {
      return null;
    }

    return {
      firstName: String(parsed.firstName ?? ''),
      lastName: String(parsed.lastName ?? ''),
      email: String(parsed.email ?? ''),
      phone: String(parsed.phone ?? ''),
      marketingOptIn: Boolean(parsed.marketingOptIn),
      smsOptIn: Boolean(parsed.smsOptIn),
      paymentMethod: validPaymentMethods.includes(parsed.paymentMethod) ? parsed.paymentMethod : null,
    };
  } catch {
    return null;
  }
}

export function saveStoredAccountCustomer(customer: CheckoutCustomer): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(customer));
  window.localStorage.setItem(ACCOUNT_EMAIL_STORAGE_KEY, customer.email.trim().toLowerCase());
}

export function readStoredAccountEmail(): string | null {
  if (typeof window === 'undefined') {
    return null;
  }

  const email = window.localStorage.getItem(ACCOUNT_EMAIL_STORAGE_KEY);
  return email ? email.trim().toLowerCase() : null;
}

export function clearStoredAccountCustomer(): void {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACCOUNT_STORAGE_KEY);
  window.localStorage.removeItem(ACCOUNT_EMAIL_STORAGE_KEY);
}

export function hasStoredAccountCustomer(): boolean {
  const stored = readStoredAccountCustomer();

  if (!stored) {
    return false;
  }

  return Boolean(
    stored.firstName.trim() &&
      stored.lastName.trim() &&
      stored.phone.trim() &&
      stored.email.trim(),
  );
}
