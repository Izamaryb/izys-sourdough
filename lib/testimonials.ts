import { prisma } from './prisma';
import type { Testimonial } from '@prisma/client';

export type TestimonialItem = {
  id: string;
  customerName: string;
  quote: string;
  detail: string;
  rating: number;
  isPublished: boolean;
  sortOrder: number;
};

export type TestimonialInput = {
  customerName: string;
  quote: string;
  detail: string;
  rating?: number;
  isPublished?: boolean;
  sortOrder?: number;
};

function mapTestimonial(testimonial: Testimonial): TestimonialItem {
  return {
    id: testimonial.id,
    customerName: testimonial.customerName,
    quote: testimonial.quote,
    detail: testimonial.detail,
    rating: testimonial.rating,
    isPublished: testimonial.isPublished,
    sortOrder: testimonial.sortOrder,
  };
}

export async function getPublishedTestimonials(): Promise<TestimonialItem[]> {
  const testimonials = await prisma.testimonial.findMany({
    where: { isPublished: true },
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return testimonials.map(mapTestimonial);
}

export async function getAllTestimonials(): Promise<TestimonialItem[]> {
  const testimonials = await prisma.testimonial.findMany({
    orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
  });

  return testimonials.map(mapTestimonial);
}

export async function getTestimonialById(id: string): Promise<TestimonialItem | null> {
  const testimonial = await prisma.testimonial.findUnique({ where: { id } });

  return testimonial ? mapTestimonial(testimonial) : null;
}

export async function createTestimonial(input: TestimonialInput): Promise<TestimonialItem> {
  const testimonial = await prisma.testimonial.create({
    data: {
      customerName: input.customerName.trim(),
      quote: input.quote.trim(),
      detail: input.detail.trim(),
      rating: input.rating ?? 5,
      isPublished: input.isPublished ?? true,
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return mapTestimonial(testimonial);
}

export async function updateTestimonial(
  id: string,
  input: Partial<TestimonialInput>,
): Promise<TestimonialItem> {
  const testimonial = await prisma.testimonial.update({
    where: { id },
    data: {
      ...(input.customerName !== undefined ? { customerName: input.customerName.trim() } : {}),
      ...(input.quote !== undefined ? { quote: input.quote.trim() } : {}),
      ...(input.detail !== undefined ? { detail: input.detail.trim() } : {}),
      ...(input.rating !== undefined ? { rating: input.rating } : {}),
      ...(input.isPublished !== undefined ? { isPublished: input.isPublished } : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
    },
  });

  return mapTestimonial(testimonial);
}

export async function deleteTestimonial(id: string): Promise<void> {
  await prisma.testimonial.delete({ where: { id } });
}
