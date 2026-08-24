import nodemailer from 'nodemailer';
import type { OrderConfirmation } from './orders';

type EmailConfig = {
  host?: string;
  port: number;
  secure: boolean;
  auth?: {
    user?: string;
    pass?: string;
  };
  from?: string;
  fromName?: string;
};

const DEFAULT_SMTP_PORT = 587;
const PICKUP_ADDRESS = '7191 Boxer Round Pl, Zephyrhills, FL 33541';

const paymentMethodLabels: Record<OrderConfirmation['paymentMethod'], string> = {
  venmo: 'Venmo',
  'cash-app': 'Cash App',
  cash: 'Cash at Pickup',
};

function getEmailConfig(): EmailConfig {
  return {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT) || DEFAULT_SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
    from: process.env.EMAIL_FROM,
    fromName: process.env.EMAIL_FROM_NAME,
  };
}

function isConfigured(config: EmailConfig): boolean {
  return Boolean(config.host && config.auth?.user && config.auth?.pass && config.from);
}

function getTransport(config: EmailConfig) {
  if (!isConfigured(config)) {
    return null;
  }

  return nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: {
      user: config.auth!.user,
      pass: config.auth!.pass,
    },
  });
}

function formatCurrency(value: number): string {
  return `$${value.toFixed(2)}`;
}

function formatPickupDate(dateValue: string): string {
  const [year, month, day] = dateValue.split('-').map(Number);

  if (!year || !month || !day) {
    return dateValue;
  }

  const date = new Date(year, month - 1, day);

  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function orderNumber(order: OrderConfirmation): string {
  return order.id.slice(-6).toUpperCase();
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function buildOrderConfirmationEmail(order: OrderConfirmation) {
  const customerName = escapeHtml(order.customerName);
  const subject = `Izy's Sourdough — Order #${orderNumber(order)} confirmed`;
  const pickupDate = formatPickupDate(order.pickupDate);
  const paymentMethod = paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod;
  const orderDate = order.createdAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const itemsText = order.items
    .map((item) => `${item.quantity}x ${item.name} — ${formatCurrency(item.lineTotal)}`)
    .join('\n');

  const text = `Hi ${order.customerName},

Thank you for your order! Here are your confirmation details.

Order number: ${orderNumber(order)}
Placed: ${orderDate}

Items:
${itemsText}

Subtotal: ${formatCurrency(order.subtotal)}

Pickup details
Date: ${pickupDate}
Time: ${order.pickupTime}
Location: ${PICKUP_ADDRESS}
Instructions: Arrive at your selected time and look for your order on the porch. Please bring exact change when possible if you chose Cash at Pickup.

Payment method: ${paymentMethod}

Order changes are allowed until 36 hours before pickup. Preorders close 48 hours before pickup.

Thanks for supporting Izy's Sourdough!
`;

  const itemsHtml = order.items
    .map(
      (item) => `
        <tr>
          <td style="padding: 10px 0; border-bottom: 1px solid #D4CEB2; color: #4A3B2F;">
            ${item.quantity}x ${escapeHtml(item.name)}
          </td>
          <td style="padding: 10px 0; border-bottom: 1px solid #D4CEB2; text-align: right; color: #4A3B2F; font-weight: 500;">
            ${formatCurrency(item.lineTotal)}
          </td>
        </tr>
      `,
    )
    .join('');

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FDFBF8; color: #4A3B2F; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.5;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color: #FDFBF8; padding: 24px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width: 600px; width: 100%; background-color: #FDFBF8; border: 1px solid #D4CEB2; border-radius: 8px; overflow: hidden;">
          <tr>
            <td style="padding: 32px 24px 24px;">
              <h1 style="margin: 0 0 16px; font-size: 24px; color: #4A3B2F;">Izy's Sourdough</h1>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4A3B2F;">Hi ${customerName},</p>
              <p style="margin: 0 0 24px; font-size: 16px; color: #4A3B2F;">Thank you for your order! Here are your confirmation details.</p>

              <h2 style="margin: 0 0 12px; font-size: 18px; color: #4A3B2F;">Order #${orderNumber(order)}</h2>
              <p style="margin: 0 0 24px; font-size: 14px; color: #706351;">Placed ${orderDate}</p>

              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px;">
                <thead>
                  <tr>
                    <th align="left" style="padding: 10px 0; border-bottom: 2px solid #D4CEB2; font-size: 14px; font-weight: 600; color: #706351; text-transform: uppercase; letter-spacing: 0.05em;">Item</th>
                    <th align="right" style="padding: 10px 0; border-bottom: 2px solid #D4CEB2; font-size: 14px; font-weight: 600; color: #706351; text-transform: uppercase; letter-spacing: 0.05em;">Total</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsHtml}
                  <tr>
                    <td style="padding: 14px 0; font-weight: 600; color: #4A3B2F;">Subtotal</td>
                    <td style="padding: 14px 0; text-align: right; font-weight: 600; color: #4A3B2F;">${formatCurrency(order.subtotal)}</td>
                  </tr>
                </tbody>
              </table>

              <h2 style="margin: 0 0 12px; font-size: 18px; color: #4A3B2F;">Pickup details</h2>
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom: 24px; background-color: #FDFBF8; border: 1px solid #D4CEB2; border-radius: 6px;">
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #706351; border-bottom: 1px solid #D4CEB2;">Date</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 500; color: #4A3B2F; border-bottom: 1px solid #D4CEB2;">${pickupDate}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #706351; border-bottom: 1px solid #D4CEB2;">Time</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 500; color: #4A3B2F; border-bottom: 1px solid #D4CEB2;">${escapeHtml(order.pickupTime)}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #706351; border-bottom: 1px solid #D4CEB2;">Location</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 500; color: #4A3B2F; border-bottom: 1px solid #D4CEB2;">${PICKUP_ADDRESS}</td>
                </tr>
                <tr>
                  <td style="padding: 12px 16px; font-size: 14px; color: #706351; border-bottom: 1px solid #D4CEB2;">Payment method</td>
                  <td style="padding: 12px 16px; font-size: 14px; font-weight: 500; color: #4A3B2F; border-bottom: 1px solid #D4CEB2;">${paymentMethod}</td>
                </tr>
                <tr>
                  <td colspan="2" style="padding: 12px 16px; font-size: 14px; color: #4A3B2F;">
                    Arrive at your selected time and look for your order on the porch. Please bring exact change when possible if you chose Cash at Pickup.
                  </td>
                </tr>
              </table>

              <p style="margin: 0 0 24px; font-size: 14px; color: #706351;">
                Order changes are allowed until 36 hours before pickup. Preorders close 48 hours before pickup.
              </p>

              <p style="margin: 0; font-size: 16px; color: #4A3B2F; font-weight: 500;">Thanks for supporting Izy's Sourdough!</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

  return { subject, text, html };
}

function buildAdminNewOrderEmail(order: OrderConfirmation) {
  const pickupDate = formatPickupDate(order.pickupDate);
  const paymentMethod = paymentMethodLabels[order.paymentMethod] ?? order.paymentMethod;
  const itemsText = order.items
    .map((item) => `${item.quantity}x ${item.name} — ${formatCurrency(item.lineTotal)}`)
    .join('\n');

  const subject = `New order #${orderNumber(order)} — ${order.customerName}`;

  const text = `New order received!

Order number: ${orderNumber(order)}
Customer: ${order.customerName}
Phone: ${order.phone}
Email: ${order.email || 'n/a'}

Items:
${itemsText}

Subtotal: ${formatCurrency(order.subtotal)}

Pickup
Date: ${pickupDate}
Time: ${order.pickupTime}
Payment method: ${paymentMethod}
`;

  return { subject, text };
}

/**
 * Sends a new-order alert to the baker's own inbox using the existing SMTP
 * transport. Configured via ADMIN_NOTIFICATION_EMAIL. Non-throwing so
 * failures never block order creation.
 */
export async function sendAdminNewOrderEmail(order: OrderConfirmation): Promise<void> {
  const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL;

  if (!adminEmail) {
    console.log('[email] ADMIN_NOTIFICATION_EMAIL not set. Skipping admin new-order email.');
    return;
  }

  const config = getEmailConfig();
  const transport = getTransport(config);
  const { subject, text } = buildAdminNewOrderEmail(order);
  const from = `${config.fromName || "Izy's Sourdough"} <${config.from}>`;

  if (!transport) {
    console.log('[email] SMTP not configured. Admin new-order email would be sent to:', adminEmail);
    console.log('[email] Subject:', subject);
    console.log('[email] Text:\n', text);
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: adminEmail,
      subject,
      text,
    });
    console.log('[email] Admin new-order email sent to:', adminEmail);
  } catch (error) {
    console.error('[email] Failed to send admin new-order email:', error);
  }
}

export async function sendOrderConfirmationEmail(order: OrderConfirmation): Promise<void> {
  if (!order.email) {
    console.warn('[email] No customer email provided. Skipping order confirmation email.');
    return;
  }

  const config = getEmailConfig();
  const transport = getTransport(config);
  const { subject, text, html } = buildOrderConfirmationEmail(order);
  const from = `${config.fromName || "Izy's Sourdough"} <${config.from}>`;

  if (!transport) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[email] SMTP is not configured in production. Order confirmation emails are NOT being sent. ' +
          'Set SMTP_HOST, SMTP_USER, SMTP_PASSWORD, and EMAIL_FROM in your hosting provider secrets. ' +
          'See .env.example for setup instructions.',
      );
    }
    console.log('[email] SMTP not configured. Order confirmation email would be sent to:', order.email);
    console.log('[email] From:', from);
    console.log('[email] Subject:', subject);
    console.log('[email] Text:\n', text);
    return;
  }

  try {
    await transport.sendMail({
      from,
      to: order.email,
      subject,
      text,
      html,
    });
    console.log('[email] Order confirmation email sent to:', order.email);
  } catch (error) {
    console.error('[email] Failed to send order confirmation email:', error);
  }
}
