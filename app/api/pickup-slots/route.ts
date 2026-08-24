import { NextResponse } from 'next/server';
import { logError } from '@/lib/logger';
import { getPickupSlotsWithAvailability, upsertPickupSlotConfig } from '@/lib/pickupSlots';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const date = searchParams.get('date');

    if (!date || !date.trim()) {
      return NextResponse.json({ error: 'Date query parameter is required.' }, { status: 400 });
    }

    const slots = await getPickupSlotsWithAvailability(date.trim());

    return NextResponse.json({ slots });
  } catch (error) {
    logError('Failed to fetch pickup slots:', error);

    return NextResponse.json(
      { error: 'Failed to load pickup slots. Please try again later.' },
      { status: 500 },
    );
  }
}

/**
 * Admin control endpoint for pickup slots. Creates a pickup window if it does
 * not already exist, or adjusts an existing window's capacity and/or
 * enabled/disabled state.
 *
 * Body: { date: string; time: string; capacity?: number; isEnabled?: boolean }
 */
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const date = body?.date;
    const time = body?.time;
    const { capacity, isEnabled } = body ?? {};

    if (typeof date !== 'string' || !date.trim()) {
      return NextResponse.json({ error: 'A pickup date is required.' }, { status: 400 });
    }

    if (typeof time !== 'string' || !time.trim()) {
      return NextResponse.json({ error: 'A pickup time is required.' }, { status: 400 });
    }

    if (capacity !== undefined && (typeof capacity !== 'number' || capacity < 1)) {
      return NextResponse.json(
        { error: 'Capacity must be a number of at least 1.' },
        { status: 400 },
      );
    }

    if (isEnabled !== undefined && typeof isEnabled !== 'boolean') {
      return NextResponse.json({ error: 'isEnabled must be a boolean.' }, { status: 400 });
    }

    const slot = await upsertPickupSlotConfig(date.trim(), time.trim(), {
      capacity,
      isEnabled,
    });

    return NextResponse.json({ slot });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith('Capacity cannot be lower')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    logError('Failed to update pickup slot:', error);

    return NextResponse.json(
      { error: 'Failed to update pickup slot. Please try again later.' },
      { status: 500 },
    );
  }
}
