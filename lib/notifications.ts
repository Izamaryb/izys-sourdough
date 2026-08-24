import type { OrderConfirmation } from './orders';
import { sendAdminNewOrderEmail, sendOrderConfirmationEmail } from './email';
import {
  buildOrderConfirmationSms,
  buildOrderStatusUpdateSms,
  sendSms,
  type SmsOrderInfo,
} from './sms';

export type OrderConfirmationEvent = {
  type: 'order-confirmation';
  order: OrderConfirmation;
};

export type OrderStatusUpdateEvent = {
  type: 'order-status-update';
  order: OrderConfirmation;
  previousStatus: string;
};

export type AdminNotificationEvent = {
  type: 'admin-new-order';
  orderId: string;
  customerName: string;
  pickupDate: string;
  pickupTime: string;
  subtotal: number;
};

function mapOrderToSmsInfo(order: OrderConfirmation): SmsOrderInfo {
  return {
    id: order.id,
    status: order.status,
    customerName: order.customerName,
    phone: order.phone,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    paymentMethod: order.paymentMethod,
    smsOptIn: order.smsOptIn,
    items: order.items.map((item) => ({
      name: item.name,
      quantity: item.quantity,
    })),
  };
}

/**
 * Sends a new-order alert to the baker's own inbox via email. Configured via
 * ADMIN_NOTIFICATION_EMAIL (see .env.example). Falls back to a console log
 * if unset. The function is async and non-throwing so notification failures
 * do not block order creation.
 */
export async function sendAdminNotification(order: OrderConfirmation): Promise<void> {
  const event: AdminNotificationEvent = {
    type: 'admin-new-order',
    orderId: order.id,
    customerName: order.customerName,
    pickupDate: order.pickupDate,
    pickupTime: order.pickupTime,
    subtotal: order.subtotal,
  };

  console.log('[notification] Admin notification event:', JSON.stringify(event));

  await sendAdminNewOrderEmail(order);
}

/**
 * Placeholder for order confirmation notifications.
 *
 * Currently logs the event so downstream integrations (email/SMS/admin webhook)
 * can be wired in without changing callers. The function is intentionally async
 * and non-throwing so notification failures do not block order creation.
 */
export async function sendOrderConfirmation(order: OrderConfirmation): Promise<void> {
  const event: OrderConfirmationEvent = {
    type: 'order-confirmation',
    order,
  };

  console.log('[notification] Order confirmation event:', JSON.stringify(event));

  try {
    await sendOrderConfirmationEmail(order);

    if (order.smsOptIn) {
      const sms = buildOrderConfirmationSms(mapOrderToSmsInfo(order));
      await sendSms(sms);
    }

    await sendAdminNotification(order);
  } catch (error) {
    console.error('[notification] Failed to prepare order confirmation notifications:', error);
  }
}

/**
 * Placeholder for order status change notifications (e.g. Ready for Pickup,
 * Picked Up, Cancelled). Same non-throwing, log-only behavior as
 * `sendOrderConfirmation` until email/SMS integrations are wired in.
 */
export async function sendOrderStatusUpdate(
  order: OrderConfirmation,
  previousStatus: string,
): Promise<void> {
  const event: OrderStatusUpdateEvent = {
    type: 'order-status-update',
    order,
    previousStatus,
  };

  console.log('[notification] Order status update event:', JSON.stringify(event));

  try {
    if (order.smsOptIn) {
      const sms = buildOrderStatusUpdateSms(mapOrderToSmsInfo(order), previousStatus);

      if (sms) {
        await sendSms(sms);
      }
    }
  } catch (error) {
    console.error('[notification] Failed to prepare order status update notifications:', error);
  }
}
