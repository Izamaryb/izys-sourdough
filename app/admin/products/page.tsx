'use client';

import { useEffect, useState } from 'react';
import { Button, Heading, InputField, Modal, SelectField, Text } from '@/components/ui';
import { classNames } from '@/lib/classNames';
import type { ProductCatalogItem } from '@/lib/products';
import type { CategorySummary } from '@/lib/categories';

type ProductFormState = {
  id?: string;
  slug: string;
  name: string;
  description: string;
  price: string;
  image: string;
  ingredients: string;
  allergens: string;
  stockQuantity: string;
  categoryId: string;
  isActive: boolean;
  isFeatured: boolean;
  isSeasonal: boolean;
};

const emptyForm: ProductFormState = {
  slug: '',
  name: '',
  description: '',
  price: '',
  image: '',
  ingredients: '',
  allergens: '',
  stockQuantity: '',
  categoryId: '',
  isActive: true,
  isFeatured: false,
  isSeasonal: false,
};

function parseCommaList(value: string): string[] {
  return value
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function formatCommaList(items: string[]): string {
  return items.join(', ');
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductCatalogItem[]>([]);
  const [categories, setCategories] = useState<CategorySummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductCatalogItem | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function loadData() {
    try {
      setIsLoading(true);
      const [productsRes, categoriesRes] = await Promise.all([
        fetch('/api/admin/products'),
        fetch('/api/categories'),
      ]);

      if (!productsRes.ok) {
        throw new Error('Failed to load products.');
      }

      if (!categoriesRes.ok) {
        throw new Error('Failed to load categories.');
      }

      const productsData = (await productsRes.json()) as { products: ProductCatalogItem[] };
      const categoriesData = (await categoriesRes.json()) as { categories: CategorySummary[] };

      setProducts(productsData.products);
      setCategories(categoriesData.categories);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function openAddModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setModalOpen(true);
  }

  function openEditModal(product: ProductCatalogItem) {
    setEditingProduct(product);
    setForm({
      id: product.id,
      slug: product.slug,
      name: product.name,
      description: product.description,
      price: (product.price).toFixed(2),
      image: product.image,
      ingredients: formatCommaList(product.ingredients),
      allergens: formatCommaList(product.allergens),
      stockQuantity: String(product.stockQuantity),
      categoryId: product.categoryId ?? '',
      isActive: product.isActive,
      isFeatured: product.isFeatured,
      isSeasonal: product.isSeasonal,
    });
    setModalOpen(true);
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const payload = {
      slug: form.slug,
      name: form.name,
      description: form.description,
      price: Number(form.price),
      image: form.image,
      ingredients: parseCommaList(form.ingredients),
      allergens: parseCommaList(form.allergens),
      stockQuantity: Number(form.stockQuantity),
      categoryId: form.categoryId || null,
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isSeasonal: form.isSeasonal,
    };

    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PATCH' : 'POST';

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? `Failed to ${editingProduct ? 'update' : 'create'} product.`);
      }

      setModalOpen(false);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function toggleActive(product: ProductCatalogItem) {
    try {
      const response = await fetch(`/api/products/${product.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: !product.isActive }),
      });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to update product.');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  async function handleDelete(product: ProductCatalogItem) {
    if (!confirm(`Delete ${product.name}? This cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/products/${product.id}`, { method: 'DELETE' });

      if (!response.ok) {
        const data = (await response.json()) as { error?: string };
        throw new Error(data.error ?? 'Failed to delete product.');
      }

      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong.');
    }
  }

  const categoryOptions = [
    { value: '', label: 'No category' },
    ...categories.map((category) => ({ value: category.id, label: category.name })),
  ];

  return (
    <div>
      <div className="mb-6 flex items-center justify-between">
        <Heading level={2}>Products</Heading>
        <Button onClick={openAddModal}>Add Product</Button>
      </div>

      {error ? <p className="mb-4 text-small text-primary">{error}</p> : null}

      {isLoading ? (
        <Text muted>Loading products…</Text>
      ) : (
        <div>
          {products.map((product) => (
            <div
              key={product.id}
              className={classNames(
                'flex flex-col gap-6 border-b border-button py-6 last:border-b-0 md:flex-row md:items-center md:justify-between',
                !product.isActive && 'opacity-60',
              )}
            >
              <div>
                <Text className="font-medium">
                  {product.name}{' '}
                  <span className="text-small text-secondary">({product.categoryName ?? 'No category'})</span>
                </Text>
                <Text size="small" muted>
                  ${product.price.toFixed(2)} · Stock: {product.stockQuantity} ·{' '}
                  {product.isActive ? 'Active' : 'Disabled'}
                </Text>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button variant="secondary" onClick={() => openEditModal(product)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => toggleActive(product)}>
                  {product.isActive ? 'Disable' : 'Enable'}
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(product)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingProduct ? 'Edit Product' : 'Add Product'}
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          <InputField
            label="Name"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
            required
          />
          <InputField
            label="Slug"
            value={form.slug}
            onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
            required
          />
          <InputField
            label="Description"
            value={form.description}
            onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            required
          />
          <InputField
            label="Price"
            type="number"
            min="0"
            step="0.01"
            value={form.price}
            onChange={(e) => setForm((prev) => ({ ...prev, price: e.target.value }))}
            required
          />
          <InputField
            label="Image path"
            value={form.image}
            onChange={(e) => setForm((prev) => ({ ...prev, image: e.target.value }))}
            required
          />
          <InputField
            label="Ingredients (comma separated)"
            value={form.ingredients}
            onChange={(e) => setForm((prev) => ({ ...prev, ingredients: e.target.value }))}
          />
          <InputField
            label="Allergens (comma separated)"
            value={form.allergens}
            onChange={(e) => setForm((prev) => ({ ...prev, allergens: e.target.value }))}
          />
          <InputField
            label="Stock quantity"
            type="number"
            min="0"
            step="1"
            value={form.stockQuantity}
            onChange={(e) => setForm((prev) => ({ ...prev, stockQuantity: e.target.value }))}
            required
          />
          <SelectField
            label="Category"
            name="categoryId"
            value={form.categoryId}
            options={categoryOptions}
            onChange={(value) => setForm((prev) => ({ ...prev, categoryId: value }))}
            required
          />
          <label className="flex items-center gap-2 font-body text-small text-primary">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => setForm((prev) => ({ ...prev, isActive: e.target.checked }))}
            />
            Active
          </label>
          <label className="flex items-center gap-2 font-body text-small text-primary">
            <input
              type="checkbox"
              checked={form.isFeatured}
              onChange={(e) => setForm((prev) => ({ ...prev, isFeatured: e.target.checked }))}
            />
            Featured
          </label>
          <label className="flex items-center gap-2 font-body text-small text-primary">
            <input
              type="checkbox"
              checked={form.isSeasonal}
              onChange={(e) => setForm((prev) => ({ ...prev, isSeasonal: e.target.checked }))}
            />
            Seasonal
          </label>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving…' : editingProduct ? 'Save Changes' : 'Create Product'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
