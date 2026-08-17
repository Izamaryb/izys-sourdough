import { prisma } from './prisma';

export type CategorySummary = {
  id: string;
  name: string;
  slug: string;
  sortOrder: number;
};

export async function getCategories(): Promise<CategorySummary[]> {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
  }));
}

export async function createCategory(input: {
  name: string;
  slug: string;
  sortOrder?: number;
}): Promise<CategorySummary> {
  const category = await prisma.category.create({
    data: {
      name: input.name.trim(),
      slug: input.slug.trim(),
      sortOrder: input.sortOrder ?? 0,
    },
  });

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    sortOrder: category.sortOrder,
  };
}
