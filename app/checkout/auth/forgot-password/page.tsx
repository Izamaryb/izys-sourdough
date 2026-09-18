'use client';

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { PageContainer, SectionContainer } from '@/components/layout';
import { Button, Heading, InputField, Text } from '@/components/ui';

const cardClasses = 'grid gap-6 rounded-lg border border-surfaceBorder bg-background p-6 shadow-card';
const linkClasses =
  'font-body text-small font-medium text-primary underline decoration-secondary/60 underline-offset-4 transition-colors duration-200 hover:text-secondary focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-4 focus-visible:outline-button';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const normalizedEmail = email.trim().toLowerCase();

    if (!normalizedEmail) {
      setError('Please enter your email.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/customers/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'request', email: normalizedEmail }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setSuccessMessage(
        data.message || 'If an account exists for this email, you will receive a password reset link.',
      );
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <PageContainer>
      <SectionContainer spacing="lg" aria-labelledby="forgot-password-heading">
        <div className="mx-auto flex max-w-xl flex-col items-center gap-4 text-center">
          <Heading id="forgot-password-heading" level={1}>
            Forgot Password
          </Heading>
          <Text className="text-primary/90">
            Enter the email address for your account and we&apos;ll send you a link to reset your
            password.
          </Text>
        </div>
      </SectionContainer>

      <SectionContainer spacing="sm">
        {successMessage ? (
          <div className={`${cardClasses} mx-auto max-w-xl text-center`}>
            <Heading level={2} className="text-xl">
              Check your email
            </Heading>
            <Text>{successMessage}</Text>
            <Button fullWidth onClick={() => router.push('/checkout/auth')}>
              Back to sign in
            </Button>
          </div>
        ) : (
          <form
            className={`${cardClasses} mx-auto max-w-xl`}
            onSubmit={handleSubmit}
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

            <Button fullWidth type="submit" disabled={isLoading}>
              {isLoading ? 'Sending...' : 'Send reset link'}
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
