'use client';

import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer, SectionContainer } from '@/components/layout';
import { getPickupDateOptions, PickupSummary } from '@/components/pickup';
import { Button, Heading, InputField, Text } from '@/components/ui';
import { validateCheckout } from '@/lib/checkoutValidation';
import { classNames } from '@/lib/classNames';
import {
  CHECKOUT_FORM_STORAGE_KEY,
  readStoredAccountCustomer,
  readStoredCheckoutForm,
  saveStoredAccountCustomer,
} from '@/lib/checkoutStorage';
import { fetchAcceptedPaymentMethods } from '@/lib/paymentMethodsApi';
import { fetchPickupSlots } from '@/lib/pickupSlotsApi';
import { fetchProducts } from '@/lib/productsApi';
import type { AcceptedPaymentMethodsSetting } from '@/lib/settings';
import { useCart } from '@/hooks/useCart';
import type { CheckoutCustomer, CheckoutFormState, PaymentMethod } from '@/types/checkout';

const initialFormState: CheckoutFormState = {
  customer: {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  },
  paymentMethod: '',
  optIns: {
    marketingOptIn: false,
    smsOptIn: false,
  },
  createAccount: false,
  accountPassword: '',
  confirmAccountPassword: '',
};

const ALL_PAYMENT_OPTIONS: { value: PaymentMethod; label: string; helper: string }[] = [
  { value: 'venmo', label: 'Venmo', helper: '' },
  { value: 'cash-app', label: 'Cash App', helper: '' },
  { value: 'cash', label: 'Cash at Pickup', helper: 'Bring exact payment when possible.' },
];

const DEFAULT_ACCEPTED_PAYMENT_METHODS: AcceptedPaymentMethodsSetting = {
  cash: true,
  venmo: true,
  'cash-app': true,
};

function formatPhoneNumber(raw: string) {
  const digits = raw.replace(/\D/g, '');
  const area = digits.slice(0, 3);
  const prefix = digits.slice(3, 6);
  const line = digits.slice(6, 10);

  if (digits.length > 10) {
    return `(${area}) ${prefix} - ${digits.slice(6)}`;
  }
  if (digits.length >= 7) {
    return `(${area}) ${prefix} - ${line}`;
  }
  if (digits.length >= 4) {
    return `(${area}) ${prefix}`;
  }
  if (digits.length > 0) {
    return `(${area}`;
  }
  return '';
}

const heroClasses = 'flex max-w-3xl flex-col items-start gap-4';
const cardClasses = 'rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const sectionGridClasses = 'grid gap-6 lg:grid-cols-[1.1fr_0.9fr]';
const itemTextClasses = 'font-body text-small font-medium text-primary';
const detailGridClasses = 'mt-5 grid gap-4 sm:grid-cols-2';
const detailBoxClasses = '';
const labelClasses = 'font-body text-small font-medium uppercase tracking-[0.14em] text-secondary';
const valueClasses = 'mt-1 font-body text-body font-medium text-primary';
const valueLinkClasses =
  'mt-1 inline-flex font-body text-body font-medium text-primary underline decoration-secondary/60 underline-offset-4 transition-colors duration-200 hover:text-secondary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';
const radioCardClasses = 'flex cursor-pointer gap-3 rounded-lg border border-surfaceBorder bg-background-soft p-4 transition-colors focus-within:border-button hover:border-button';
const selectedCardClasses = 'border-button bg-accent/10';
const checkboxClasses = 'mt-1 size-5 rounded border-accent accent-button focus:ring-button';
const errorClasses = 'mt-3 font-body text-small text-primary';

export default function CheckoutPage() {
  const router = useRouter();
  const cart = useCart();
  const [formState, setFormState] = useState<CheckoutFormState>(initialFormState);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [availabilityError, setAvailabilityError] = useState<string | null>(null);
  const [isCheckingAvailability, setIsCheckingAvailability] = useState(false);
  const [storedAccount, setStoredAccount] = useState<CheckoutCustomer | null>(null);
  const [acceptedPaymentMethods, setAcceptedPaymentMethods] = useState<AcceptedPaymentMethodsSetting>(
    DEFAULT_ACCEPTED_PAYMENT_METHODS,
  );
  const [isLoadingPaymentMethods, setIsLoadingPaymentMethods] = useState(true);
  const canPersistRef = useRef(false);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    let cancelled = false;

    fetchAcceptedPaymentMethods()
      .then((methods) => {
        if (!cancelled) {
          setAcceptedPaymentMethods(methods);
        }
      })
      .catch(() => {
        // Fall back to the default (all methods enabled) if the setting can't be loaded.
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingPaymentMethods(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  const paymentOptions = useMemo(
    () => ALL_PAYMENT_OPTIONS.filter((option) => acceptedPaymentMethods[option.value]),
    [acceptedPaymentMethods],
  );

  useEffect(() => {
    if (
      formState.paymentMethod &&
      !acceptedPaymentMethods[formState.paymentMethod as PaymentMethod]
    ) {
      setFormState((current) => ({ ...current, paymentMethod: '' }));
    }
  }, [acceptedPaymentMethods, formState.paymentMethod]);

  useEffect(() => {
    if (typeof window === 'undefined' || !canPersistRef.current) {
      return;
    }

    window.sessionStorage.setItem(CHECKOUT_FORM_STORAGE_KEY, JSON.stringify(formState));
  }, [formState]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const searchParams = new URLSearchParams(window.location.search);
    const isGuest = searchParams.get('guest') === '1';
    const wantsAccount = searchParams.get('createAccount') === '1';

    if (cart.hasItems) {
      if (!hasLoadedRef.current) {
        if (isGuest) {
          window.sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
          setFormState({ ...initialFormState, createAccount: wantsAccount });
          setStoredAccount(null);
        } else {
          const stored = readStoredCheckoutForm();

          if (stored) {
            setFormState(stored);
          } else {
            const account = readStoredAccountCustomer();

            if (account) {
              setStoredAccount(account);
              setFormState((current) => ({
                ...current,
                customer: {
                  ...account,
                  phone: formatPhoneNumber(account.phone),
                },
                paymentMethod: account.paymentMethod || current.paymentMethod,
                optIns: {
                  ...current.optIns,
                  marketingOptIn: account.marketingOptIn ?? current.optIns.marketingOptIn,
                  smsOptIn: account.smsOptIn ?? current.optIns.smsOptIn,
                },
                createAccount: true,
              }));
            }
          }
        }

        hasLoadedRef.current = true;
        canPersistRef.current = true;
      }

      return;
    }

    if (hasLoadedRef.current) {
      hasLoadedRef.current = false;
      canPersistRef.current = false;
      window.sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      setFormState(initialFormState);
    }
  }, [cart.hasItems]);

  useEffect(() => {
    const pickupDate = cart.selectedPickupDate;
    const pickupTime = cart.selectedPickupTime;

    if (!cart.hasItems || !pickupDate || !pickupTime) {
      setAvailabilityError(null);
      return;
    }

    let cancelled = false;

    async function checkAvailability() {
      setIsCheckingAvailability(true);
      setAvailabilityError(null);

      try {
        const [products, slots] = await Promise.all([
          fetchProducts(),
          fetchPickupSlots(pickupDate as string),
        ]);

        if (cancelled) {
          return;
        }

        for (const item of cart.items) {
          const product = products.find((p) => p.slug === item.id);
          const availableStock = product?.stockQuantity ?? 0;

          if (!product || availableStock < item.quantity) {
            setAvailabilityError(
              `Not enough inventory for ${item.name}. Only ${availableStock} left. Please update your cart.`,
            );
            return;
          }
        }

        const selectedSlot = slots.find((slot) => slot.value === cart.selectedPickupTime);

        if (!selectedSlot || selectedSlot.reserved) {
          setAvailabilityError(
            'The selected pickup time is no longer available. Please choose another time.',
          );
          return;
        }
      } catch {
        // Don't block checkout if availability check fails; the backend is the source of truth.
      } finally {
        if (!cancelled) {
          setIsCheckingAvailability(false);
        }
      }
    }

    checkAvailability();

    return () => {
      cancelled = true;
    };
  }, [cart.hasItems, cart.items, cart.selectedPickupDate, cart.selectedPickupTime]);

  const validation = useMemo(
    () =>
      validateCheckout({
        ...formState,
        hasItems: cart.hasItems,
        hasPickupDate: cart.hasPickupDate,
        hasPickupTime: cart.hasPickupTime,
      }),
    [cart.hasItems, cart.hasPickupDate, cart.hasPickupTime, formState],
  );

  const pickupDateOptions = useMemo(() => getPickupDateOptions(), []);
  const selectedPickupDate = cart.selectedPickupDate ?? 'Not selected';
  const selectedPickupTime = cart.selectedPickupTime ?? 'Not selected';
  const selectedPickupDateLabel = pickupDateOptions.find(
    (date) => date.value === cart.selectedPickupDate,
  )?.label;

  const customerName = `${formState.customer.firstName} ${formState.customer.lastName}`.trim() || 'Not provided';
  const customerPhone = formState.customer.phone.trim() || 'Not provided';
  const customerEmail = formState.customer.email.trim() || 'Not provided';

  const selectedItems = useMemo(
    () =>
      cart.items.map((item) => ({
        name: item.name,
        quantity: item.quantity,
        lineTotal: Number((item.quantity * item.price).toFixed(2)),
      })),
    [cart.items],
  );

  function updateCustomerField(field: keyof CheckoutFormState['customer'], value: string) {
    setFormState((current) => ({
      ...current,
      customer: {
        ...current.customer,
        [field]: value,
      },
      ...(field === 'email' && !value.trim() ? { createAccount: false } : {}),
    }));
  }

  function updateMarketingOptIn(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({
      ...current,
      optIns: {
        ...current.optIns,
        marketingOptIn: event.target.checked,
      },
    }));
  }

  function updateSmsOptIn(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({
      ...current,
      optIns: {
        ...current.optIns,
        smsOptIn: event.target.checked,
      },
    }));
  }

  function updateCreateAccount(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({
      ...current,
      createAccount: event.target.checked,
    }));
  }

  function updateAccountPassword(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({
      ...current,
      accountPassword: event.target.value,
    }));
  }

  function updateConfirmAccountPassword(event: ChangeEvent<HTMLInputElement>) {
    setFormState((current) => ({
      ...current,
      confirmAccountPassword: event.target.value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setHasSubmitted(true);
    setSubmitError(null);

    if (!validation.isValid || !formState.paymentMethod || !cart.pickupDate || !cart.pickupTime) {
      requestAnimationFrame(() => {
        const firstError = document.querySelector('[data-field-error="true"]');
        firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      });
      return;
    }

    if (availabilityError || isCheckingAvailability) {
      return;
    }

    if (
      formState.createAccount &&
      !storedAccount &&
      formState.accountPassword.trim().length < 8
    ) {
      setSubmitError('Please create a password with at least 8 characters.');
      return;
    }

    if (
      formState.createAccount &&
      !storedAccount &&
      formState.accountPassword.trim() !== formState.confirmAccountPassword.trim()
    ) {
      setSubmitError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    cart.setIsPlacingOrder(true);
    window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: {
            firstName: formState.customer.firstName,
            lastName: formState.customer.lastName,
            email: formState.customer.email,
            phone: formState.customer.phone.replace(/\D/g, ''),
            marketingOptIn: formState.optIns.marketingOptIn,
            smsOptIn: formState.optIns.smsOptIn,
            ...(formState.createAccount && formState.accountPassword.trim()
              ? { password: formState.accountPassword.trim() }
              : {}),
          },
          items: cart.items.map((item) => ({ productId: item.id, quantity: item.quantity })),
          pickupDate: cart.pickupDate,
          pickupTime: cart.pickupTime,
          paymentMethod: formState.paymentMethod,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to place order. Please try again.');
      }

      if (formState.createAccount && formState.customer.email.trim()) {
        saveStoredAccountCustomer({
          ...formState.customer,
          marketingOptIn: formState.optIns.marketingOptIn,
          smsOptIn: formState.optIns.smsOptIn,
          paymentMethod: formState.paymentMethod,
        });
      }

      window.sessionStorage.removeItem(CHECKOUT_FORM_STORAGE_KEY);
      canPersistRef.current = false;
      cart.clearCart();

      await router.push(`/order-confirmation/${data.order.id}`);
    } catch (error) {
      console.error('Failed to place order:', error);
      setSubmitError(error instanceof Error ? error.message : 'Failed to place order. Please try again.');
      setIsSubmitting(false);
      cart.setIsPlacingOrder(false);
    }
  }

  if (isSubmitting) {
    return (
      <PageContainer>
        <SectionContainer
          spacing="lg"
          className="flex min-h-[60vh] flex-col items-center justify-center text-center"
        >
          <div className="flex flex-col items-center gap-6">
            <div
              className="h-12 w-12 animate-spin rounded-full border-4 border-surfaceBorder border-t-button"
              aria-hidden="true"
            />
            <Heading level={1}>Placing your order...</Heading>
            <Text className="text-primary/90">
              Just a moment while we finalize your preorder.
            </Text>
          </div>
        </SectionContainer>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <SectionContainer spacing="lg" className="pb-4 md:pb-6" aria-labelledby="checkout-heading">
        <div className={heroClasses}>
          <Heading id="checkout-heading" level={1}>
            Review & Place Your Order
          </Heading>
          <Text className="text-primary/90">
            Confirm your bread, pickup details, and contact information.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm" className="pt-4 md:pt-6">
        <form className={sectionGridClasses} onSubmit={handleSubmit} noValidate>
          <div className="grid gap-6">
            <div className="grid gap-3">
              <PickupSummary
                items={selectedItems}
                subtotal={cart.subtotal}
                selectedDateLabel={selectedPickupDateLabel}
                selectedTime={cart.selectedPickupTime ?? undefined}
              />
              {hasSubmitted && validation.errors.cart ? <p className={errorClasses}>{validation.errors.cart}</p> : null}
              {hasSubmitted && validation.errors.pickup ? <p className={errorClasses}>{validation.errors.pickup}</p> : null}
            </div>

            <section className={cardClasses} aria-labelledby="customer-info-heading">
              <Heading id="customer-info-heading" level={2} className="scroll-mt-24">
                Customer Information
              </Heading>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <InputField
                  label="First Name"
                  name="firstName"
                  value={formState.customer.firstName}
                  onChange={(event) => updateCustomerField('firstName', event.target.value)}
                  error={hasSubmitted ? validation.errors.firstName : undefined}
                  required
                />
                <InputField
                  label="Last Name"
                  name="lastName"
                  value={formState.customer.lastName}
                  onChange={(event) => updateCustomerField('lastName', event.target.value)}
                  error={hasSubmitted ? validation.errors.lastName : undefined}
                  required
                />
                <InputField
                  label="Phone Number"
                  name="phone"
                  type="tel"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={formState.customer.phone}
                  onChange={(event) => updateCustomerField('phone', formatPhoneNumber(event.target.value))}
                  error={hasSubmitted ? validation.errors.phone : undefined}
                  required
                />
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  value={formState.customer.email}
                  onChange={(event) => updateCustomerField('email', event.target.value)}
                  error={hasSubmitted ? validation.errors.email : undefined}
                  required
                />
                {!storedAccount && formState.customer.email.trim() ? (
                  <label className="flex gap-3 font-body text-small text-primary sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formState.createAccount}
                      onChange={updateCreateAccount}
                      className={checkboxClasses}
                    />
                    <span>Save my information and create an account for faster checkout next time.</span>
                  </label>
                ) : null}
                {formState.createAccount && !storedAccount ? (
                  <>
                    <div className="sm:col-span-2">
                      <InputField
                        label="Create Password"
                        name="accountPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formState.accountPassword}
                        onChange={updateAccountPassword}
                        required
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <InputField
                        label="Confirm Password"
                        name="confirmAccountPassword"
                        type="password"
                        autoComplete="new-password"
                        value={formState.confirmAccountPassword}
                        onChange={updateConfirmAccountPassword}
                        required
                      />
                    </div>
                  </>
                ) : null}
                {!(storedAccount?.marketingOptIn) ? (
                  <label className="flex gap-3 font-body text-small text-primary sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formState.optIns.marketingOptIn}
                      onChange={updateMarketingOptIn}
                      className={checkboxClasses}
                    />
                    <span>
                      Send me emails about new loaves, specials, and bakery updates. (Optional — you can
                      unsubscribe anytime.)
                    </span>
                  </label>
                ) : null}
                {!(storedAccount?.smsOptIn) ? (
                  <label className="flex gap-3 font-body text-small text-primary sm:col-span-2">
                    <input
                      type="checkbox"
                      checked={formState.optIns.smsOptIn}
                      onChange={updateSmsOptIn}
                      className={checkboxClasses}
                    />
                    <span>
                      Send me text message reminders about my order. (Optional — standard message rates may
                      apply.)
                    </span>
                  </label>
                ) : null}
              </div>
            </section>

            <section className={cardClasses} aria-labelledby="pickup-confirmation-heading">
              <Heading id="pickup-confirmation-heading" level={2}>
                Pickup Confirmation
              </Heading>
              <div className={detailGridClasses}>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Name</p>
                  <Link href="#customer-info-heading" className={valueLinkClasses}>
                    {customerName}
                  </Link>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Phone</p>
                  <Link href="#customer-info-heading" className={valueLinkClasses}>
                    {customerPhone}
                  </Link>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Email</p>
                  <Link href="#customer-info-heading" className={valueLinkClasses}>
                    {customerEmail}
                  </Link>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Pickup Day</p>
                  <p className={valueClasses}>
                    {cart.selectedPickupDate
                      ? new Date(`${cart.selectedPickupDate}T12:00:00`).toLocaleDateString('en-US', {
                          weekday: 'long',
                          timeZone: 'America/New_York',
                        })
                      : 'Not selected'}
                  </p>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Pickup Date</p>
                  <Link href="/pickup#pickup-heading" className={valueLinkClasses}>
                    {selectedPickupDate}
                  </Link>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Pickup Time</p>
                  <Link href="/pickup#pickup-heading" className={valueLinkClasses}>
                    {selectedPickupTime}
                  </Link>
                </div>
                <div className={detailBoxClasses}>
                  <p className={labelClasses}>Location</p>
                  <p className={valueClasses}>7191 Boxer Round Pl, Zephyrhills, FL 33541</p>
                </div>
              </div>
              <Text size="small" className="mt-4 text-primary/90">
                Preorders close 48 hours before pickup.
              </Text>
            </section>
          </div>

          <div className="grid gap-6 lg:sticky lg:top-24 lg:self-start">
            <section className={cardClasses} aria-labelledby="payment-heading">
              <Heading id="payment-heading" level={2}>
                Preferred Payment Method
              </Heading>
              <Text size="small" className="mt-2 text-primary/90">
                Payment is not collected during checkout. You’ll pay later at pickup.
              </Text>
              <div className="mt-5 grid gap-3" role="radiogroup" aria-labelledby="payment-heading">
                {isLoadingPaymentMethods ? (
                  ALL_PAYMENT_OPTIONS.map((option) => (
                    <div
                      key={option.value}
                      className={classNames(radioCardClasses, 'animate-pulse')}
                      aria-hidden="true"
                    >
                      <div className="h-5 w-5 rounded-full bg-primary/10" />
                      <span className="h-4 w-24 rounded bg-primary/10" />
                    </div>
                  ))
                ) : (
                  paymentOptions.map((option) => (
                    <label
                      key={option.value}
                      className={classNames(
                        radioCardClasses,
                        formState.paymentMethod === option.value && selectedCardClasses,
                      )}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={formState.paymentMethod === option.value}
                        onChange={() => setFormState((current) => ({ ...current, paymentMethod: option.value }))}
                        onClick={() =>
                          setFormState((current) => ({
                            ...current,
                            paymentMethod: current.paymentMethod === option.value ? '' : option.value,
                          }))
                        }
                        className="mt-1 size-4 accent-button"
                      />
                      <span>
                        <span className={itemTextClasses}>{option.label}</span>
                        <span className="mt-1 block font-body text-small text-primary/90">{option.helper}</span>
                      </span>
                    </label>
                  ))
                )}
              </div>
              {hasSubmitted && validation.errors.paymentMethod ? (
                <p className={errorClasses}>{validation.errors.paymentMethod}</p>
              ) : null}
            </section>

            <section className={cardClasses} aria-label="Place order">
              {submitError ? <p className={errorClasses}>{submitError}</p> : null}
              {availabilityError ? <p className={errorClasses}>{availabilityError}</p> : null}
              <Button
                fullWidth
                type="submit"
                disabled={isSubmitting || isCheckingAvailability}
              >
                {isSubmitting ? 'Placing Order...' : 'Place Order'}
              </Button>
              <Text size="small" className="mt-4 text-primary/90">
                Products are made in a home kitchen operating under Florida Cottage Food law.
              </Text>
            </section>
          </div>
        </form>
      </SectionContainer>
    </PageContainer>
  );
}
