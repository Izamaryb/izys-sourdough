import { prisma } from './prisma';
import type { Product, Category } from '@prisma/client';

export type ProductInventoryStatus = 'available' | 'low' | 'sold-out';

type ProductWithCategory = Product & { category: Category | null };

export type ProductCatalogItem = {
  id: string;
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  allergens: string[];
  inventoryStatus: ProductInventoryStatus;
  stockQuantity: number;
  isActive: boolean;
  isFeatured: boolean;
  isSeasonal: boolean;
  seasonalStartDate: string | null;
  seasonalEndDate: string | null;
  sortOrder: number;
  categoryId: string | null;
  categoryName: string | null;
  categorySlug: string | null;
};

export type ProductInput = {
  slug: string;
  name: string;
  description: string;
  price: number;
  image: string;
  ingredients: string[];
  allergens: string[];
  stockQuantity: number;
  isActive?: boolean;
  isFeatured?: boolean;
  isSeasonal?: boolean;
  seasonalStartDate?: string | null;
  seasonalEndDate?: string | null;
  sortOrder?: number;
  categoryId?: string | null;
};

function mapInventoryStatus(status: Product['inventoryStatus']): ProductInventoryStatus {
  if (status === 'soldOut') {
    return 'sold-out';
  }

  return status;
}

function mapProductToCatalogItem(product: ProductWithCategory): ProductCatalogItem {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    description: product.description,
    price: product.priceCents / 100,
    image: product.image,
    ingredients: parseJsonArray(product.ingredients),
    allergens: parseJsonArray(product.allergens),
    inventoryStatus: mapInventoryStatus(product.inventoryStatus),
    stockQuantity: product.stockQuantity,
    isActive: product.isActive,
    isFeatured: product.isFeatured,
    isSeasonal: product.isSeasonal,
    seasonalStartDate: product.seasonalStartDate ? product.seasonalStartDate.toISOString() : null,
    seasonalEndDate: product.seasonalEndDate ? product.seasonalEndDate.toISOString() : null,
    sortOrder: product.sortOrder,
    categoryId: product.categoryId,
    categoryName: product.category?.name ?? null,
    categorySlug: product.category?.slug ?? null,
  };
}

function parseJsonArray(value: string): string[] {
  try {
    const parsed = JSON.parse(value);

    if (Array.isArray(parsed)) {
      return parsed.filter((item): item is string => typeof item === 'string');
    }
  } catch {
    // fall through to empty array
  }

  return [];
}

export async function getActiveProducts(): Promise<ProductCatalogItem[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { category: true },
  });

  return products.map(mapProductToCatalogItem);
}

export async function getFeaturedProducts(): Promise<ProductCatalogItem[]> {
  const products = await prisma.product.findMany({
    where: { isActive: true, isFeatured: true },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { category: true },
  });

  return products.map(mapProductToCatalogItem);
}

export async function getAllProducts(): Promise<ProductCatalogItem[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    include: { category: true },
  });

  return products.map(mapProductToCatalogItem);
}

export async function getProductBySlug(slug: string): Promise<ProductCatalogItem | null> {
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  return product ? mapProductToCatalogItem(product) : null;
}

export async function getProductById(id: string): Promise<ProductCatalogItem | null> {
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true },
  });

  return product ? mapProductToCatalogItem(product) : null;
}

function toSeasonalDate(value: string | null | undefined): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export async function createProduct(input: ProductInput): Promise<ProductCatalogItem> {
  const product = await prisma.product.create({
    data: {
      slug: input.slug.trim(),
      name: input.name.trim(),
      description: input.description,
      priceCents: Math.round(input.price * 100),
      image: input.image,
      ingredients: JSON.stringify(input.ingredients),
      allergens: JSON.stringify(input.allergens),
      stockQuantity: input.stockQuantity,
      isActive: input.isActive ?? true,
      isFeatured: input.isFeatured ?? false,
      isSeasonal: input.isSeasonal ?? false,
      seasonalStartDate: toSeasonalDate(input.seasonalStartDate),
      seasonalEndDate: toSeasonalDate(input.seasonalEndDate),
      sortOrder: input.sortOrder ?? 0,
      categoryId: input.categoryId ?? null,
    },
    include: { category: true },
  });

  return mapProductToCatalogItem(product);
}

export async function updateProduct(
  id: string,
  input: Partial<ProductInput>,
): Promise<ProductCatalogItem> {
  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(input.slug !== undefined ? { slug: input.slug.trim() } : {}),
      ...(input.name !== undefined ? { name: input.name.trim() } : {}),
      ...(input.description !== undefined ? { description: input.description } : {}),
      ...(input.price !== undefined ? { priceCents: Math.round(input.price * 100) } : {}),
      ...(input.image !== undefined ? { image: input.image } : {}),
      ...(input.ingredients !== undefined
        ? { ingredients: JSON.stringify(input.ingredients) }
        : {}),
      ...(input.allergens !== undefined ? { allergens: JSON.stringify(input.allergens) } : {}),
      ...(input.stockQuantity !== undefined ? { stockQuantity: input.stockQuantity } : {}),
      ...(input.isActive !== undefined ? { isActive: input.isActive } : {}),
      ...(input.isFeatured !== undefined ? { isFeatured: input.isFeatured } : {}),
      ...(input.isSeasonal !== undefined ? { isSeasonal: input.isSeasonal } : {}),
      ...(input.seasonalStartDate !== undefined
        ? { seasonalStartDate: toSeasonalDate(input.seasonalStartDate) }
        : {}),
      ...(input.seasonalEndDate !== undefined
        ? { seasonalEndDate: toSeasonalDate(input.seasonalEndDate) }
        : {}),
      ...(input.sortOrder !== undefined ? { sortOrder: input.sortOrder } : {}),
      ...(input.categoryId !== undefined ? { categoryId: input.categoryId } : {}),
    },
    include: { category: true },
  });

  return mapProductToCatalogItem(product);
}

export async function deleteProduct(id: string): Promise<void> {
  await prisma.product.delete({ where: { id } });
}
