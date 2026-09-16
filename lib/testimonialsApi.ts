import type { TestimonialItem } from './testimonials';

export type TestimonialsApiResponse = {
  testimonials: TestimonialItem[];
};

export type TestimonialApiResponse = {
  testimonial: TestimonialItem;
};

export type ApiErrorResponse = {
  error: string;
};

export async function fetchTestimonials(): Promise<TestimonialItem[]> {
  const response = await fetch('/api/testimonials', { cache: 'no-store' });
  const data = (await response.json()) as TestimonialsApiResponse | ApiErrorResponse;

  if (!response.ok || !('testimonials' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load testimonials';
    throw new Error(message);
  }

  return data.testimonials;
}
