import { prisma } from './prisma';

export type AcceptedPaymentMethodsSetting = {
  cash: boolean;
  venmo: boolean;
  'cash-app': boolean;
};

export type VacationModeSetting = {
  enabled: boolean;
  startDate: string | null;
  endDate: string | null;
};

const DEFAULT_PAYMENT_METHODS: AcceptedPaymentMethodsSetting = {
  cash: true,
  venmo: true,
  'cash-app': true,
};

const DEFAULT_VACATION_MODE: VacationModeSetting = {
  enabled: false,
  startDate: null,
  endDate: null,
};

function todayInET(): string {
  const now = new Date();
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return formatter.format(now);
}

async function getSetting<T>(key: string, fallback: T): Promise<T> {
  const setting = await prisma.setting.findUnique({ where: { key } });

  if (!setting) {
    return fallback;
  }

  try {
    return JSON.parse(setting.value) as T;
  } catch {
    return fallback;
  }
}

async function setSetting<T>(key: string, value: T): Promise<void> {
  await prisma.setting.upsert({
    where: { key },
    update: { value: JSON.stringify(value) },
    create: { key, value: JSON.stringify(value) },
  });
}

export async function getAcceptedPaymentMethods(): Promise<AcceptedPaymentMethodsSetting> {
  return getSetting<AcceptedPaymentMethodsSetting>('accepted-payment-methods', DEFAULT_PAYMENT_METHODS);
}

export async function setAcceptedPaymentMethods(methods: AcceptedPaymentMethodsSetting): Promise<void> {
  await setSetting('accepted-payment-methods', methods);
}

export async function getVacationMode(): Promise<VacationModeSetting> {
  return getSetting<VacationModeSetting>('vacation-mode', DEFAULT_VACATION_MODE);
}

export async function setVacationMode(vacation: VacationModeSetting): Promise<void> {
  await setSetting('vacation-mode', vacation);
}

export async function isVacationModeActive(date?: string): Promise<boolean> {
  const vacation = await getVacationMode();

  if (!vacation.enabled) {
    return false;
  }

  const targetDate = date ?? todayInET();

  if (vacation.startDate && targetDate < vacation.startDate) {
    return false;
  }

  if (vacation.endDate && targetDate > vacation.endDate) {
    return false;
  }

  return true;
}
