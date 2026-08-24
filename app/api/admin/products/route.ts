import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getAllProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllProducts();

    return NextResponse.json({ products });
  } catch (error) {
    logError('Failed to fetch admin products:', error);

    return NextResponse.json(
      { error: 'Failed to load products. Please try again later.' },
      { status: 500 },
    );
  }
}
