import twilio from 'twilio';

export type SmsMessage = {
  to: string;
  body: string;
};

type SmsConfig = {
  accountSid?: string;
  authToken?: string;
  fromNumber?: string;
};

function getSmsConfig(): SmsConfig {
  return {
    accountSid: process.env.TWILIO_ACCOUNT_SID,
    authToken: process.env.TWILIO_AUTH_TOKEN,
    fromNumber: process.env.TWILIO_FROM_NUMBER,
  };
}

function isConfigured(config: SmsConfig): config is Required<SmsConfig> {
  return Boolean(config.accountSid && config.authToken && config.fromNumber);
}

let cachedClient: ReturnType<typeof twilio> | null = null;

function getClient(config: Required<SmsConfig>) {
  if (!cachedClient) {
    cachedClient = twilio(config.accountSid, config.authToken);
  }

  return cachedClient;
}

export type SmsOrderInfo = {
  id: string;
  status: string;
  customerName: string;
  phone: string;
  pickupDate: string;
  pickupTime: string;
  paymentMethod: string;
  smsOptIn: boolean;
  items: Array<{
    name: string;
    quantity: number;
  }>;
};

const PAYMENT_LABELS: Record<string, string> = {
  venmo: 'Venmo',
  'cash-app': 'Cash App',
  cash: 'Cash at pickup',
};

export function formatSmsPhoneNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '');

  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`;
  }

  if (digits.length === 10) {
    return `+1${digits}`;
  }

  return digits ? `+${digits}` : '';
}

function formatItemSummary(items: SmsOrderInfo['items']): string {
  return items.map((item) => `${item.quantity}x ${item.name}`).join(', ');
}

export function buildOrderConfirmationSms(order: SmsOrderInfo): SmsMessage {
  const firstName = order.customerName.split(' ')[0] ?? 'there';
  const paymentLabel = PAYMENT_LABELS[order.paymentMethod] ?? order.paymentMethod;
  const items = formatItemSummary(order.items);

  return {
    to: formatSmsPhoneNumber(order.phone),
    body: `Hi ${firstName}, your Izy's Sourdough order #${order.id.slice(0, 8)} is confirmed. Pickup ${order.pickupDate} at ${order.pickupTime}. ${items}. Pay via ${paymentLabel}.`,
  };
}

export function buildOrderStatusUpdateSms(
  order: SmsOrderInfo,
  previousStatus: string,
): SmsMessage | null {
  if (order.status !== 'readyForPickup' || previousStatus === 'readyForPickup') {
    return null;
  }

  const firstName = order.customerName.split(' ')[0] ?? 'there';

  return {
    to: formatSmsPhoneNumber(order.phone),
    body: `Hi ${firstName}, your Izy's Sourdough order #${order.id.slice(0, 8)} is ready for pickup at ${order.pickupTime}. See you soon!`,
  };
}

/**
 * Sends an SMS via Twilio if configured, otherwise logs the prepared message.
 *
 * The function is async and non-throwing so SMS failures do not block order
 * creation or status updates.
 */
export async function sendSms(message: SmsMessage): Promise<void> {
  if (!message.to) {
    console.warn('[sms] No destination phone number. Skipping SMS:', JSON.stringify(message));
    return;
  }

  const config = getSmsConfig();

  if (!isConfigured(config)) {
    console.log('[sms] Twilio not configured. SMS would be sent:', JSON.stringify(message));
    return;
  }

  try {
    const client = getClient(config);

    await client.messages.create({
      to: message.to,
      from: config.fromNumber,
      body: message.body,
    });

    console.log('[sms] SMS sent to:', message.to);
  } catch (error) {
    console.error('[sms] Failed to send SMS:', error);
  }
}
