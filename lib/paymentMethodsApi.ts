import type { AcceptedPaymentMethodsSetting } from '@/lib/settings';

export type PaymentMethodsApiResponse = {
  paymentMethods: AcceptedPaymentMethodsSetting;
};

export type ApiErrorResponse = {
  error: string;
};

export async function fetchAcceptedPaymentMethods(): Promise<AcceptedPaymentMethodsSetting> {
  const response = await fetch('/api/settings/payment-methods', {
    cache: 'no-store',
  });
  const data = (await response.json()) as PaymentMethodsApiResponse | ApiErrorResponse;

  if (!response.ok || !('paymentMethods' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load payment methods';
    throw new Error(message);
  }

  return data.paymentMethods;
}
