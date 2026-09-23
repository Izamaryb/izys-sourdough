'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, InputField, Modal, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import type { TestimonialItem } from '@/lib/testimonials';

type TestimonialFormState = {
  id?: string;
  customerName: string;
  quote: string;
  detail: string;
  rating: string;
  sortOrder: string;
  isPublished: boolean;
};

const emptyForm: TestimonialFormState = {
  customerName: '',
  quote: '',
  detail: '',
  rating: '5',
  sortOrder: '0',
  isPublished: true,
};

export default function AdminTestimonialsPage() {
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTestimonial, setEditingTestimonial] = useState<TestimonialItem | null>(null);
  const [form, setForm] = useState<TestimonialFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/testimonials');

      if (!response.ok) {
        throw new Error('Failed to load testimonials.');
      }

      const data = (await response.json()) as { testimonials: TestimonialItem[] };

      setTestimonials(data.testimonials);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddModal() {
    setEditingTestimonial(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(testimonial: TestimonialItem) {
    setEditingTestimonial(testimonial);
    setForm({
      id: testimonial.id,
      customerName: testimonial.customerName,
      quote: testimonial.quote,
      detail: testimonial.detail,
      rating: String(testimonial.rating),
      sortOrder: String(testimonial.sortOrder),
      isPublished: testimonial.isPublished,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      customerName: form.customerName,
      quote: form.quote,
      detail: form.detail,
      rating: Number(form.rating),
      sortOrder: Number(form.sortOrder),
      isPublished: form.isPublished,
    };

    try {
      const url = editingTestimonial
        ? `/api/admin/testimonials/${editingTestimonial.id}`
        : '/api/admin/testimonials';
      const method = editingTestimonial ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `Failed to ${editingTestimonial ? 'update' : 'create'} testimonial.`);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function togglePublished(testimonial: TestimonialItem) {
    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPublished: !testimonial.isPublished }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to update testimonial.');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function handleDelete(testimonial: TestimonialItem) {
    if (!confirm(`Delete testimonial from ${testimonial.customerName}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/testimonials/${testimonial.id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to delete testimonial.');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Heading level={2}>Testimonials</Heading>
        <Button onClick={openAddModal}>Add Testimonial</Button>
      </div>

      {error ? <p className="mb-4 text-small text-primary">{error}</p> : null}

      {isLoading ? (
        <Text muted>Loading testimonials…</Text>
      ) : (
        <div>
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className={classNames(
                'flex flex-col gap-6 border-b border-button py-6 last:border-b-0 md:flex-row md:items-center md:justify-between',
                !testimonial.isPublished && 'opacity-60',
              )}
            >
              <div>
                <Text className="font-medium">{testimonial.customerName}</Text>
                <Text size="small" muted>
                  &ldquo;{testimonial.quote}&rdquo;
                </Text>
                <Text size="small" muted>
                  {testimonial.detail} · Rating: {testimonial.rating} ·{' '}
                  {testimonial.isPublished ? 'Published' : 'Unpublished'}
                </Text>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openEditModal(testimonial)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => togglePublished(testimonial)}>
                  {testimonial.isPublished ? 'Unpublish' : 'Publish'}
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(testimonial)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingTestimonial ? 'Edit Testimonial' : 'Add Testimonial'}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <InputField
            label="Customer name"
            value={form.customerName}
            onChange={(e) => setForm((prev) => ({ ...prev, customerName: e.target.value }))}
            required
          />
          <div className="grid gap-2">
            <label htmlFor="testimonial-quote" className="font-body text-small font-medium text-primary">
              Quote
              <span aria-hidden="true"> *</span>
            </label>
            <textarea
              id="testimonial-quote"
              className="min-h-24 w-full rounded-lg border border-accent bg-background px-4 py-3 font-body text-small text-primary placeholder:text-secondary focus:border-button focus:outline-none"
              value={form.quote}
              onChange={(e) => setForm((prev) => ({ ...prev, quote: e.target.value }))}
              required
            />
          </div>
          <InputField
            label="Detail (e.g. favorite loaf, repeat customer)"
            value={form.detail}
            onChange={(e) => setForm((prev) => ({ ...prev, detail: e.target.value }))}
            required
          />
          <InputField
            label="Rating (1-5)"
            type="number"
            min="1"
            max="5"
            step="1"
            value={form.rating}
            onChange={(e) => setForm((prev) => ({ ...prev, rating: e.target.value }))}
            required
          />
          <InputField
            label="Sort order"
            type="number"
            step="1"
            value={form.sortOrder}
            onChange={(e) => setForm((prev) => ({ ...prev, sortOrder: e.target.value }))}
          />
          <label className="flex items-center gap-2 font-body text-small text-primary">
            <input
              type="checkbox"
              checked={form.isPublished}
              onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
            />
            Published
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editingTestimonial ? 'Save Changes' : 'Create Testimonial'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
