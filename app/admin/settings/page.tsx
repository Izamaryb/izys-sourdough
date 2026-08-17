'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, InputField, Text } from '@/components/ui';
import type { AcceptedPaymentMethodsSetting, VacationModeSetting } from '@/lib/settings';

export default function AdminSettingsPage() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<AcceptedPaymentMethodsSetting>({
    cash: true,
    venmo: true,
    'cash-app': true,
  });
  const [vacationMode, setVacationMode] = useState<VacationModeSetting>({
    enabled: false,
    startDate: null,
    endDate: null,
  });

  async function loadSettings() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/settings');

      if (!response.ok) {
        throw new Error('Failed to load settings.');
      }

      const data = (await response.json()) as {
        paymentMethods: AcceptedPaymentMethodsSetting;
        vacationMode: VacationModeSetting;
      };

      setPaymentMethods(data.paymentMethods);
      setVacationMode(data.vacationMode);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSettings();
  }, []);

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setSuccess(false);

    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentMethods, vacationMode }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to save settings.');
      }

      setSuccess(true);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div>
      <Heading level={2} className="mb-6">
        Settings
      </Heading>

      {isLoading ? (
        <Text muted>Loading settings…</Text>
      ) : (
        <form onSubmit={handleSave} className="grid gap-8">
          <section className="rounded-lg border border-surfaceBorder bg-background-soft p-6 shadow-card">
            <Heading level={3} className="mb-4">
              Accepted Payment Methods
            </Heading>
            <div className="grid gap-3">
              {(
                [
                  { key: 'cash', label: 'Cash' },
                  { key: 'venmo', label: 'Venmo' },
                  { key: 'cash-app', label: 'Cash App' },
                ] as const
              ).map(({ key, label }) => (
                <label
                  key={key}
                  className="flex items-center gap-3 font-body text-small text-primary"
                >
                  <input
                    type="checkbox"
                    checked={paymentMethods[key]}
                    onChange={(e) =>
                      setPaymentMethods((prev) => ({ ...prev, [key]: e.target.checked }))
                    }
                    className="h-5 w-5 accent-button"
                  />
                  {label}
                </label>
              ))}
            </div>
          </section>

          <section className="rounded-lg border border-surfaceBorder bg-background-soft p-6 shadow-card">
            <Heading level={3} className="mb-4">
              Vacation Mode
            </Heading>
            <label className="mb-4 flex items-center gap-3 font-body text-small text-primary">
              <input
                type="checkbox"
                checked={vacationMode.enabled}
                onChange={(e) =>
                  setVacationMode((prev) => ({ ...prev, enabled: e.target.checked }))
                }
                className="h-5 w-5 accent-button"
              />
              Enable vacation mode
            </label>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Start date"
                type="date"
                value={vacationMode.startDate ?? ''}
                onChange={(e) =>
                  setVacationMode((prev) => ({
                    ...prev,
                    startDate: e.target.value || null,
                  }))
                }
              />
              <InputField
                label="End date"
                type="date"
                value={vacationMode.endDate ?? ''}
                onChange={(e) =>
                  setVacationMode((prev) => ({
                    ...prev,
                    endDate: e.target.value || null,
                  }))
                }
              />
            </div>
            <Text size="small" muted className="mt-3">
              When enabled, bake sessions cannot be created for pickup dates within the range.
            </Text>
          </section>

          {error ? <p className="text-small text-primary">{error}</p> : null}
          {success ? <p className="text-small text-button">Settings saved.</p> : null}

          <div className="flex justify-end">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
