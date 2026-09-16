import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getPublishedTestimonials } from '@/lib/testimonials';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const testimonials = await getPublishedTestimonials();

    return NextResponse.json({ testimonials });
  } catch (error) {
    logError('Failed to fetch testimonials:', error);

    return NextResponse.json(
      { error: 'Failed to load testimonials. Please try again later.' },
      { status: 500 },
    );
  }
}
