import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getVacationMode } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const vacationMode = await getVacationMode();

    return NextResponse.json({ vacationMode });
  } catch (error) {
    logError('Failed to fetch vacation mode:', error);

    return NextResponse.json(
      { error: 'Failed to load vacation mode. Please try again later.' },
      { status: 500 },
    );
  }
}
