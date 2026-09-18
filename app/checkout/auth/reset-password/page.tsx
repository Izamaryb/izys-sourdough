'use client';

import { Suspense, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, InputField, Text } from '@/components/ui';

const cardClasses = 'grid gap-6 rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const linkClasses =
  'font-body text-small font-medium text-primary underline decoration-secondary/60 underline-offset-4 transition-colors duration-200 hover:text-secondary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  if (!token) {
    return (
      <PageContainer>
        <SectionContainer spacing="lg" className="text-center">
          <div className="mx-auto max-w-xl">
            <Heading level={1}>Invalid Link</Heading>
            <Text className="mt-4 text-primary/90">
              This password reset link is missing or invalid. Please request a new one.
            </Text>
            <Link href="/checkout/auth/forgot-password" className={`${linkClasses} mt-6 inline-block`}>
              Request a new reset link
            </Link>
          </div>
        </SectionContainer>
      </PageContainer>
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!password.trim()) {
      setError('Please enter a new password.');
      return;
    }

    if (password.trim().length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    if (password.trim() !== confirmPassword.trim()) {
      setError('Passwords do not match.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'confirm', token, password: password.trim() }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccessMessage(data.message || 'Your password has been updated.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="reset-password-heading">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <Heading id="reset-password-heading" level={1}>
            Reset Password
          </Heading>
          <Text className="text-primary/90">Choose a new password for your account.</Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm">
        {successMessage ? (
          <div className={`${cardClasses} mx-auto max-w-xl text-center`}>
            <Heading level={2} className="text-xl">
              Password updated
            </Heading>
            <Text>{successMessage}</Text>
            <Button fullWidth onClick={() => router.push('/checkout/auth')}>
              Sign in
            </Button>
          </div>
        ) : (
          <form
            className={`${cardClasses} mx-auto max-w-xl`}
            onSubmit={handleSubmit}
            noValidate
          >
            <InputField
              label="New password"
              name="password"
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => {
                setPassword(event.target.value);
                if (error) setError(null);
              }}
              required
            />

            <InputField
              label="Confirm new password"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              value={confirmPassword}
              onChange={(event) => {
                setConfirmPassword(event.target.value);
                if (error) setError(null);
              }}
              error={error ?? undefined}
              required
            />

            <Button fullWidth type="submit" disabled={isLoading}>
              {isLoading ? 'Updating...' : 'Update password'}
            </Button>

            <Link href="/checkout/auth" className={`${linkClasses} mx-auto`}>
              Back to sign in
            </Link>
          </form>
        )}
      </SectionContainer>
    </PageContainer>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <PageContainer>
          <SectionContainer spacing="lg" className="text-center">
            <div className="mx-auto max-w-xl">
              <Heading level={1}>Reset Password</Heading>
              <Text className="mt-4 text-primary/90">Loading...</Text>
            </div>
          </SectionContainer>
        </PageContainer>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
