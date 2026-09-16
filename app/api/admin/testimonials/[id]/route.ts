import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { deleteTestimonial, updateTestimonial, type TestimonialInput } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<TestimonialInput>;

    const testimonial = await updateTestimonial(id, body);

    return NextResponse.json({ testimonial });
  } catch (error) {
    logError('Failed to update testimonial:', error);

    const message = error instanceof Error ? error.message : 'Failed to update testimonial.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await deleteTestimonial(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Failed to delete testimonial:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete testimonial.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
