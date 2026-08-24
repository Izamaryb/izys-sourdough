import { NextRequest, NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { createProduct, getActiveProducts, getFeaturedProducts, type ProductInput } from '@/lib/products';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const featured = request.nextUrl.searchParams.get('featured');
    const products = featured === 'true' ? await getFeaturedProducts() : await getActiveProducts();

    return NextResponse.json({ products });
  } catch (error) {
    logError('Failed to fetch products:', error);

    return NextResponse.json(
      { error: 'Failed to load products. Please try again later.' },
      { status: 500 },
    );
  }
}

function isValidProductInput(value: unknown): value is ProductInput {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const body = value as Record<string, unknown>;

  return (
    typeof body.slug === 'string' &&
    body.slug.trim().length > 0 &&
    typeof body.name === 'string' &&
    body.name.trim().length > 0 &&
    typeof body.description === 'string' &&
    typeof body.price === 'number' &&
    typeof body.image === 'string' &&
    Array.isArray(body.ingredients) &&
    Array.isArray(body.allergens) &&
    typeof body.stockQuantity === 'number'
  );
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (!isValidProductInput(body)) {
      return NextResponse.json(
        {
          error:
            'slug, name, description, price, image, ingredients, allergens, and stockQuantity are required.',
        },
        { status: 400 },
      );
    }

    const product = await createProduct(body);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    logError('Failed to create product:', error);

    const message = error instanceof Error ? error.message : 'Failed to create product.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
