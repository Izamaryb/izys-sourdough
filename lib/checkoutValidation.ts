import type { CheckoutValidationInput, CheckoutValidationResult } from '@/types/checkout';

function isValidPhoneNumber(phone: string) {
  const digitsOnly = phone.replace(/\D/g, '');

  return digitsOnly.length === 10 || (digitsOnly.length === 11 && digitsOnly.startsWith('1'));
}

function isValidEmailAddress(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function validateCheckout(input: CheckoutValidationInput): CheckoutValidationResult {
  const errors: CheckoutValidationResult['errors'] = {};
  const firstName = input.customer.firstName.trim();
  const lastName = input.customer.lastName.trim();
  const email = input.customer.email.trim();
  const phone = input.customer.phone.trim();

  if (!input.hasItems) {
    errors.cart = 'Add at least one loaf before checkout.';
  }

  if (!input.hasPickupDate || !input.hasPickupTime) {
    errors.pickup = 'Choose a pickup date and time before checkout.';
  }

  if (!firstName) {
    errors.firstName = 'Please enter your first name.';
  }

  if (!lastName) {
    errors.lastName = 'Please enter your last name.';
  }

  if (!email) {
    errors.email = 'Please enter your email address.';
  } else if (!isValidEmailAddress(email)) {
    errors.email = 'Please enter a valid email address.';
  }

  if (!phone) {
    errors.phone = 'Please enter your phone number.';
  } else if (!isValidPhoneNumber(phone)) {
    errors.phone = 'Please enter a valid phone number.';
  }

  if (!input.paymentMethod) {
    errors.paymentMethod = 'Please choose a payment method.';
  }

  return {
    errors,
    isValid: Object.keys(errors).length === 0,
  };
}
