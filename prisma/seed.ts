import { BakeSessionStatus } from '@prisma/client';
import { prisma } from '../lib/prisma';

const seedCategories = [
  { name: 'Bread', slug: 'bread', sortOrder: 1 },
  { name: 'Muffins', slug: 'muffins', sortOrder: 2 },
  { name: 'Mini Cakes', slug: 'mini-cakes', sortOrder: 3 },
];

const seedProducts = [
  {
    slug: 'classic-country-loaf',
    categorySlug: 'bread',
    name: 'Classic Country Loaf',
    description:
      'A naturally leavened sourdough with a crisp crust, tender crumb, and classic tang.',
    priceCents: 1200,
    image: '/images/classic-country-loaf.JPG',
    ingredients: JSON.stringify([
      'Organic flour',
      'Filtered water',
      'Sourdough starter',
      'Himalayan salt',
    ]),
    allergens: JSON.stringify(['Wheat']),
    inventoryStatus: 'available' as const,
    stockQuantity: 24,
    isActive: true,
    isFeatured: true,
    sortOrder: 1,
  },
  {
    slug: 'jalapeno-cheddar-sourdough',
    categorySlug: 'bread',
    name: 'Jalapeño Cheddar Sourdough',
    description:
      'A savory small-batch loaf folded with sharp cheddar and jalapeño for a warm, flavorful bite.',
    priceCents: 1500,
    image: '/images/jalapeno-cheddar-sourdough.jpg',
    ingredients: JSON.stringify([
      'Organic flour',
      'Filtered water',
      'Sourdough starter',
      'Sharp cheddar',
      'Jalapeño',
      'Himalayan salt',
    ]),
    allergens: JSON.stringify(['Wheat', 'Dairy']),
    inventoryStatus: 'low' as const,
    stockQuantity: 6,
    isActive: true,
    isFeatured: true,
    sortOrder: 2,
  },
  {
    slug: 'cinnamon-raisin-sourdough',
    categorySlug: 'bread',
    name: 'Cinnamon Raisin Sourdough',
    description:
      'A cozy, lightly sweet sourdough with cinnamon warmth and raisins tucked throughout the loaf.',
    priceCents: 1400,
    image: '/images/cinnamon-raisin-sourdough.jpg',
    ingredients: JSON.stringify([
      'Organic flour',
      'Filtered water',
      'Sourdough starter',
      'Raisins',
      'Cinnamon',
      'Brown sugar',
      'Himalayan salt',
    ]),
    allergens: JSON.stringify(['Wheat']),
    inventoryStatus: 'soldOut' as const,
    stockQuantity: 0,
    isActive: true,
    isFeatured: true,
    sortOrder: 3,
  },
];

const seedTestimonials = [
  {
    customerName: 'Maria',
    quote: 'The crust was perfect and the bread still tasted warm and fresh when we brought it home.',
    detail: 'Favorite loaf: Classic Country Loaf',
    rating: 5,
    sortOrder: 1,
  },
  {
    customerName: 'Angela',
    quote: 'Pickup was simple, and the jalapeño cheddar loaf disappeared before dinner was over.',
    detail: 'Repeat local customer',
    rating: 5,
    sortOrder: 2,
  },
  {
    customerName: 'Denise',
    quote: 'You can tell it is made with care. It feels special without being fussy.',
    detail: 'Loves Wednesday pickup',
    rating: 5,
    sortOrder: 3,
  },
];

async function main() {
  console.log('Seeding database...');

  const categoryIdBySlug = new Map<string, string>();

  for (const category of seedCategories) {
    const record = await prisma.category.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
      },
      create: category,
    });

    categoryIdBySlug.set(category.slug, record.id);
  }

  console.log(`Seeded ${seedCategories.length} categories.`);

  for (const { categorySlug, ...product } of seedProducts) {
    const categoryId = categoryIdBySlug.get(categorySlug) ?? null;

    await prisma.product.upsert({
      where: { slug: product.slug },
      update: {
        name: product.name,
        description: product.description,
        priceCents: product.priceCents,
        image: product.image,
        ingredients: product.ingredients,
        allergens: product.allergens,
        inventoryStatus: product.inventoryStatus,
        stockQuantity: product.stockQuantity,
        isActive: product.isActive,
        isFeatured: product.isFeatured,
        sortOrder: product.sortOrder,
        categoryId,
      },
      create: { ...product, categoryId },
    });
  }

  console.log(`Seeded ${seedProducts.length} products.`);

  const seedBakeSessions = getUpcomingWednesdayBakeSessions(8);

  for (const session of seedBakeSessions) {
    const existing = await prisma.bakeSession.findFirst({
      where: { pickupDate: session.pickupDate },
    });

    if (!existing) {
      await prisma.bakeSession.create({
        data: {
          bakeDate: session.bakeDate,
          pickupDate: session.pickupDate,
          maxCapacity: session.maxCapacity,
          reservedUnits: 0,
          status: BakeSessionStatus.open,
        },
      });
    }
  }

  console.log(`Seeded ${seedBakeSessions.length} bake sessions.`);

  const existingTestimonialCount = await prisma.testimonial.count();

  if (existingTestimonialCount === 0) {
    await prisma.testimonial.createMany({ data: seedTestimonials });
    console.log(`Seeded ${seedTestimonials.length} testimonials.`);
  } else {
    console.log('Testimonials already exist, skipping seed.');
  }
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getUpcomingWednesdayBakeSessions(count: number) {
  const today = new Date();
  const dayOfWeek = today.getDay();
  const daysUntilWednesday = (3 - dayOfWeek + 7) % 7 || 7;
  const nextWednesday = new Date(today);
  nextWednesday.setDate(today.getDate() + daysUntilWednesday);

  const sessions: Array<{ bakeDate: string; pickupDate: string; maxCapacity: number }> = [];

  for (let index = 0; index < count; index += 1) {
    const pickupDate = new Date(nextWednesday);
    pickupDate.setDate(nextWednesday.getDate() + index * 7);

    const bakeDate = new Date(pickupDate);
    bakeDate.setDate(pickupDate.getDate() - 1);

    sessions.push({
      bakeDate: formatDateValue(bakeDate),
      pickupDate: formatDateValue(pickupDate),
      maxCapacity: 40,
    });
  }

  return sessions;
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
