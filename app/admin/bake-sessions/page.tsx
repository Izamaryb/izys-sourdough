'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, InputField, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import type { BakeSessionSummary } from '@/lib/bakeSessions';

export default function AdminBakeSessionsPage() {
  const [sessions, setSessions] = useState<BakeSessionSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    bakeDate: '',
    pickupDate: '',
    maxCapacity: '',
  });
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [capacityDraft, setCapacityDraft] = useState('');
  const [isSavingCapacity, setIsSavingCapacity] = useState(false);

  async function loadSessions() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/bake-sessions');

      if (!response.ok) {
        throw new Error('Failed to load bake sessions.');
      }

      const data = (await response.json()) as { sessions: BakeSessionSummary[] };
      setSessions(data.sessions);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadSessions();
  }, []);

  async function handleCreate(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    try {
      const response = await fetch('/api/admin/bake-sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bakeDate: form.bakeDate,
          pickupDate: form.pickupDate,
          maxCapacity: Number(form.maxCapacity),
        }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to create bake session.');
      }

      setForm({ bakeDate: '', pickupDate: '', maxCapacity: '' });
      await loadSessions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  function startEditingCapacity(session: BakeSessionSummary) {
    setEditingSessionId(session.id);
    setCapacityDraft(String(session.maxCapacity));
    setError(null);
  }

  function cancelEditingCapacity() {
    setEditingSessionId(null);
    setCapacityDraft('');
  }

  async function saveCapacity(session: BakeSessionSummary) {
    const maxCapacity = Number(capacityDraft);
    if (Number.isNaN(maxCapacity) || maxCapacity < 1) {
      setError('Capacity must be at least 1.');
      return;
    }

    setIsSavingCapacity(true);

    try {
      const response = await fetch('/api/admin/bake-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.id, maxCapacity }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to update capacity.');
      }

      const data = (await response.json()) as { session: BakeSessionSummary };
      setSessions((prev) => prev.map((s) => (s.id === session.id ? data.session : s)));
      setError(null);
      setEditingSessionId(null);
      setCapacityDraft('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSavingCapacity(false);
    }
  }

  async function closeSession(session: BakeSessionSummary) {
    if (!confirm(`Close bake session for ${session.pickupDate}?`)) {
      return;
    }

    try {
      const response = await fetch('/api/admin/bake-sessions', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: session.id, action: 'close' }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(errorData.error ?? 'Failed to close session.');
      }

      const data = (await response.json()) as { session: BakeSessionSummary };
      setSessions((prev) => prev.map((s) => (s.id === session.id ? data.session : s)));
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div>
      <Heading level={2} className="mb-6">
        Bake Sessions
      </Heading>

      <form
        onSubmit={handleCreate}
        className="mb-8 grid gap-4 border-b border-button p-4 pb-8 md:grid-cols-4"
      >
        <InputField
          label="Bake date"
          type="date"
          value={form.bakeDate}
          onChange={(e) => setForm((prev) => ({ ...prev, bakeDate: e.target.value }))}
          required
        />
        <InputField
          label="Pickup date"
          type="date"
          value={form.pickupDate}
          onChange={(e) => setForm((prev) => ({ ...prev, pickupDate: e.target.value }))}
          required
        />
        <InputField
          label="Max capacity"
          type="number"
          min="1"
          step="1"
          value={form.maxCapacity}
          onChange={(e) => setForm((prev) => ({ ...prev, maxCapacity: e.target.value }))}
          required
        />
        <div className="flex items-end">
          <Button type="submit" fullWidth disabled={isSubmitting}>
            {isSubmitting ? 'Creating…' : 'Create Session'}
          </Button>
        </div>
      </form>

      {error ? <p className="mb-4 text-small text-primary">{error}</p> : null}

      {isLoading ? (
        <Text muted>Loading sessions…</Text>
      ) : (
        <div>
          {sessions.map((session) => (
            <div
              key={session.id}
              className={classNames(
                'flex flex-col gap-4 border-b border-button py-6 last:border-b-0 md:flex-row md:items-center md:justify-between',
                session.status === 'closed' && 'opacity-60',
              )}
            >
              <div>
                <Text className="font-medium">
                  Pickup {session.pickupDate}{' '}
                  <span className="text-small text-secondary">(bake {session.bakeDate})</span>
                </Text>
                <Text size="small" muted>
                  {session.reservedUnits} / {session.maxCapacity} reserved · {session.status}
                </Text>
              </div>
              {editingSessionId === session.id ? (
                <div className="flex flex-wrap items-end gap-2">
                  <InputField
                    label="Max capacity"
                    type="number"
                    min="1"
                    step="1"
                    value={capacityDraft}
                    onChange={(e) => setCapacityDraft(e.target.value)}
                    autoFocus
                  />
                  <Button onClick={() => saveCapacity(session)} disabled={isSavingCapacity}>
                    {isSavingCapacity ? 'Saving…' : 'Save'}
                  </Button>
                  <Button variant="secondary" onClick={cancelEditingCapacity} disabled={isSavingCapacity}>
                    Cancel
                  </Button>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  <Button variant="secondary" onClick={() => startEditingCapacity(session)}>
                    Change Capacity
                  </Button>
                  {session.status !== 'closed' ? (
                    <Button variant="secondary" onClick={() => closeSession(session)}>
                      Close
                    </Button>
                  ) : null}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
