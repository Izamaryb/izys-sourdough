/**
 * Sends a one-off order confirmation email using a mock order, without going
 * through checkout. Useful for verifying SMTP credentials.
 *
 * Usage:
 *   npx tsx scripts/test-email.ts you@example.com
 *
 * Reads SMTP_* / EMAIL_FROM* from .env.local (falls back to .env).
 */
import * as fs from 'fs';
import * as path from 'path';
import { sendOrderConfirmationEmail } from '../lib/email';
import type { OrderConfirmation } from '../lib/orders';

function loadEnvLocal() {
  const envLocalPath = path.resolve(process.cwd(), '.env.local');

  if (!fs.existsSync(envLocalPath)) {
    return;
  }

  const contents = fs.readFileSync(envLocalPath, 'utf-8');

  for (const line of contents.split('\n')) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) {
      continue;
    }

    const eqIndex = trimmed.indexOf('=');

    if (eqIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, eqIndex).trim();
    let value = trimmed.slice(eqIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    process.env[key] = value;
  }
}

loadEnvLocal();

async function main() {
  const to = process.argv[2];

  if (!to) {
    console.error('Usage: npx tsx scripts/test-email.ts you@example.com');
    process.exit(1);
  }

  const mockOrder: OrderConfirmation = {
    id: 'test-order-1234567890',
    status: 'confirmed',
    customerName: 'Test Customer',
    email: to,
    phone: '5555550123',
    pickupDate: new Date().toISOString().slice(0, 10),
    pickupTime: '10:00 AM - 11:00 AM',
    paymentMethod: 'cash',
    paymentStatus: 'pending',
    marketingOptIn: false,
    smsOptIn: false,
    subtotal: 24.5,
    items: [
      { name: 'Classic Country Loaf', quantity: 2, unitPrice: 9.0, lineTotal: 18.0 },
      { name: 'Cinnamon Raisin Sourdough', quantity: 1, unitPrice: 6.5, lineTotal: 6.5 },
    ],
    createdAt: new Date(),
  };

  console.log(`[test-email] Sending test order confirmation email to ${to}...`);
  await sendOrderConfirmationEmail(mockOrder);
  console.log('[test-email] Done. Check console output above and your inbox.');
}

main().catch((error) => {
  console.error('[test-email] Failed:', error);
  process.exit(1);
});
