import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { createTestimonial, getAllTestimonials, type TestimonialInput } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const testimonials = await getAllTestimonials();

    return NextResponse.json({ testimonials });
  } catch (error) {
    logError('Failed to fetch admin testimonials:', error);

    return NextResponse.json(
      { error: 'Failed to load testimonials. Please try again later.' },
      { status: 500 },
    );
  }
}

function isValidTestimonialInput(value: unknown): value is TestimonialInput {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.customerName === 'string' &&
    body.customerName.trim().length > 0 &&
    typeof body.quote === 'string' &&
    body.quote.trim().length > 0 &&
    typeof body.detail === 'string' &&
    body.detail.trim().length > 0
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidTestimonialInput(body)) {
      return NextResponse.json(
        { error: 'customerName, quote, and detail are required.' },
        { status: 400 },
      );
    }

    const testimonial = await createTestimonial(body);

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    logError('Failed to create testimonial:', error);

    const message = error instanceof Error ? error.message : 'Failed to create testimonial.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
