import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import {
  getAcceptedPaymentMethods,
  getVacationMode,
  setAcceptedPaymentMethods,
  setVacationMode,
  type AcceptedPaymentMethodsSetting,
  type VacationModeSetting,
} from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const [paymentMethods, vacationMode] = await Promise.all([
      getAcceptedPaymentMethods(),
      getVacationMode(),
    ]);

    return NextResponse.json({ paymentMethods, vacationMode });
  } catch (error) {
    logError('Failed to fetch settings:', error);

    return NextResponse.json(
      { error: 'Failed to load settings. Please try again later.' },
      { status: 500 },
    );
  }
}

function isValidPaymentMethods(value: unknown): value is AcceptedPaymentMethodsSetting {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const methods = value as Record<string, unknown>;

  return (
    typeof methods.cash === 'boolean' &&
    typeof methods.venmo === 'boolean' &&
    typeof methods['cash-app'] === 'boolean'
  );
}

function isValidVacationMode(value: unknown): value is VacationModeSetting {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const vacation = value as Record<string, unknown>;

  return (
    typeof vacation.enabled === 'boolean' &&
    (vacation.startDate === null || typeof vacation.startDate === 'string') &&
    (vacation.endDate === null || typeof vacation.endDate === 'string')
  );
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (isValidPaymentMethods(body?.paymentMethods)) {
      await setAcceptedPaymentMethods(body.paymentMethods);
    }

    if (isValidVacationMode(body?.vacationMode)) {
      await setVacationMode(body.vacationMode);
    }

    const [paymentMethods, vacationMode] = await Promise.all([
      getAcceptedPaymentMethods(),
      getVacationMode(),
    ]);

    return NextResponse.json({ paymentMethods, vacationMode });
  } catch (error) {
    logError('Failed to update settings:', error);

    return NextResponse.json(
      { error: 'Failed to update settings. Please try again later.' },
      { status: 500 },
    );
  }
}
