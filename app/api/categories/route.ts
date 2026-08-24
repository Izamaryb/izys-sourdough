import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { createCategory, getCategories } from '@/lib/categories';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const categories = await getCategories();

    return NextResponse.json({ categories });
  } catch (error) {
    logError('Failed to fetch categories:', error);

    return NextResponse.json(
      { error: 'Failed to load categories. Please try again later.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body?.name !== 'string' ||
      !body.name.trim() ||
      typeof body?.slug !== 'string' ||
      !body.slug.trim()
    ) {
      return NextResponse.json({ error: 'Category name and slug are required.' }, { status: 400 });
    }

    const category = await createCategory({
      name: body.name,
      slug: body.slug,
      sortOrder: typeof body.sortOrder === 'number' ? body.sortOrder : undefined,
    });

    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    logError('Failed to create category:', error);

    const message = error instanceof Error ? error.message : 'Failed to create category.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
