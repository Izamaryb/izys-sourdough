import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import {
  deleteProduct,
  getProductById,
  getProductBySlug,
  updateProduct,
  type ProductInput,
} from '@/lib/products';

export const dynamic = 'force-dynamic';

type RouteParams = {
  params: Promise<{ id: string }>;
};

export async function GET(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    let product = await getProductBySlug(id);

    if (!product) {
      product = await getProductById(id);
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    return NextResponse.json({ product });
  } catch (error) {
    logError('Failed to fetch product:', error);

    return NextResponse.json(
      { error: 'Failed to load product. Please try again later.' },
      { status: 500 },
    );
  }
}

export async function PATCH(request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;
    const body = (await request.json()) as Partial<ProductInput>;

    const product = await updateProduct(id, body);

    return NextResponse.json({ product });
  } catch (error) {
    logError('Failed to update product:', error);

    const message = error instanceof Error ? error.message : 'Failed to update product.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: RouteParams) {
  try {
    const { id } = await params;

    await deleteProduct(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    logError('Failed to delete product:', error);

    const message = error instanceof Error ? error.message : 'Failed to delete product.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
