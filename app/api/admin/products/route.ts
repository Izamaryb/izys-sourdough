import { NextResponse } from 'next/server';
import { getAllProducts } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const products = await getAllProducts();

    return NextResponse.json({ products });
  } catch (error) {
    console.error('Failed to fetch admin products:', error);

    return NextResponse.json(
      { error: 'Failed to load products. Please try again later.' },
      { status: 500 },
    );
  }
}
