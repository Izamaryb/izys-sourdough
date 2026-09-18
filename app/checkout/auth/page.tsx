'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, InputField, Text } from '@/components/ui';
import {
  readStoredAccountEmail,
  saveStoredAccountCustomer,
} from '@/lib/checkoutStorage';
import { useCart } from '@/hooks/useCart';

const cardClasses = 'grid gap-6 rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const dividerClasses = 'relative flex items-center py-2';
const dividerLineClasses = 'h-px flex-1 bg-surfaceBorder';
const dividerTextClasses =
  'absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-background px-3 font-body text-small text-secondary';
const createAccountLinkClasses =
  'font-body text-small font-medium text-primary underline decoration-secondary/60 underline-offset-4 transition-colors duration-200 hover:text-secondary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';

export default function CheckoutAuthPage() {
  const router = useRouter();
  const cart = useCart();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const storedEmail = readStoredAccountEmail();

    if (storedEmail) {
      setEmail(storedEmail);
    }
  }, []);

  if (!cart.hasItems) {
    return (
      <PageContainer>
        <SectionContainer spacing="lg" aria-labelledby="checkout-auth-heading">
          <div className="flex max-w-3xl flex-col items-start gap-4">
            <Heading id="checkout-auth-heading" level={1}>
              Checkout
            </Heading>
            <Text className="text-primary/90">
              Your cart is empty. Add a loaf from the menu to continue checkout.
            </Text>
            <Link href="/menu">
              <Button className="mt-2">Browse the Menu</Button>
            </Link>
          </div>
        </SectionContainer>
      </PageContainer>
    );
  }

  async function handleSignIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Please enter your email.');
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customers/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, password }),
      });

      if (!response.ok) {
        if (response.status === 401 || response.status === 404) {
          setError('Invalid email or password.');
          return;
        }

        setError('Something went wrong. Please try again or continue as guest.');
        return;
      }

      const data = await response.json();
      const customer = data.customer;

      if (!customer) {
        setError('Invalid email or password.');
        return;
      }

      saveStoredAccountCustomer(customer);
      router.push('/checkout');
    } catch {
      setError('Something went wrong. Please try again or continue as guest.');
    } finally {
      setIsLoading(false);
    }
  }

  function handleContinueAsGuest() {
    router.push('/checkout?guest=1');
  }

  function handleCreateAccount() {
    router.push('/checkout?guest=1&createAccount=1');
  }

  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="checkout-auth-heading">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <Heading id="checkout-auth-heading" level={1}>
            Welcome Back
          </Heading>
          <Text className="text-primary/90">
            Sign in with your email and password for a faster checkout, or continue as guest. New
            here? You can create an account too.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm">
        <form
          className={`${cardClasses} mx-auto max-w-xl`}
          onSubmit={handleSignIn}
          noValidate
        >
          <InputField
            label="Email"
            name="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => {
              setEmail(event.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            required
          />
          <InputField
            label="Password"
            name="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(event) => {
              setPassword(event.target.value);
              if (error) setError(null);
            }}
            error={error ?? undefined}
            required
          />
          <Button fullWidth type="submit" disabled={isLoading}>
            {isLoading ? 'Signing in...' : 'Sign In for Faster Checkout'}
          </Button>

          <Link href="/checkout/auth/forgot-password" className={`${createAccountLinkClasses} mx-auto`}>
            Forgot password?
          </Link>

          <button
            type="button"
            onClick={handleCreateAccount}
            disabled={isLoading}
            className={`${createAccountLinkClasses} mx-auto`}
          >
            New here? Create an account
          </button>

          <div className={dividerClasses}>
            <span className={dividerLineClasses} aria-hidden="true" />
            <span className={dividerTextClasses}>or</span>
            <span className={dividerLineClasses} aria-hidden="true" />
          </div>

          <Button
            fullWidth
            type="button"
            variant="secondary"
            onClick={handleContinueAsGuest}
            disabled={isLoading}
          >
            Continue as Guest
          </Button>
        </form>
      </SectionContainer>
    </PageContainer>
  );
}
