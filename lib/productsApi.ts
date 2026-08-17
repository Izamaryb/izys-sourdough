import type { ProductCatalogItem } from './products';

export type ProductsApiResponse = {
  products: ProductCatalogItem[];
};

export type ProductApiResponse = {
  product: ProductCatalogItem;
};

export type ApiErrorResponse = {
  error: string;
};

export async function fetchProducts(): Promise<ProductCatalogItem[]> {
  const response = await fetch('/api/products', { cache: 'no-store' });
  const data = (await response.json()) as ProductsApiResponse | ApiErrorResponse;

  if (!response.ok || !('products' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load products';
    throw new Error(message);
  }

  return data.products;
}

export async function fetchProductById(id: string): Promise<ProductCatalogItem> {
  const response = await fetch(`/api/products/${encodeURIComponent(id)}`, {
    cache: 'no-store',
  });
  const data = (await response.json()) as ProductApiResponse | ApiErrorResponse;

  if (!response.ok || !('product' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load product';
    throw new Error(message);
  }

  return data.product;
}
