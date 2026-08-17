import { NextResponse } from 'next/server';
import {
  closeBakeSession,
  createBakeSession,
  getBakeSessions,
  updateBakeSessionCapacity,
} from '@/lib/bakeSessions';
import { isVacationModeActive } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const sessions = await getBakeSessions();

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error('Failed to fetch bake sessions:', error);

    return NextResponse.json(
      { error: 'Failed to load bake sessions. Please try again later.' },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (
      typeof body?.bakeDate !== 'string' ||
      !body.bakeDate.trim() ||
      typeof body?.pickupDate !== 'string' ||
      !body.pickupDate.trim() ||
      typeof body?.maxCapacity !== 'number' ||
      body.maxCapacity < 1
    ) {
      return NextResponse.json(
        { error: 'Bake date, pickup date, and a positive max capacity are required.' },
        { status: 400 },
      );
    }

    const pickupDate = body.pickupDate.trim();

    if (await isVacationModeActive(pickupDate)) {
      return NextResponse.json(
        { error: 'Cannot create a bake session during vacation mode.' },
        { status: 409 },
      );
    }

    const session = await createBakeSession({
      bakeDate: body.bakeDate.trim(),
      pickupDate,
      maxCapacity: body.maxCapacity,
    });

    return NextResponse.json({ session }, { status: 201 });
  } catch (error) {
    console.error('Failed to create bake session:', error);

    const message = error instanceof Error ? error.message : 'Failed to create bake session.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, maxCapacity } = body ?? {};

    if (typeof id !== 'string' || !id.trim()) {
      return NextResponse.json({ error: 'A session id is required.' }, { status: 400 });
    }

    if (typeof maxCapacity === 'number' && maxCapacity >= 1) {
      const session = await updateBakeSessionCapacity(id.trim(), maxCapacity);
      return NextResponse.json({ session });
    }

    if (body?.action === 'close') {
      const session = await closeBakeSession(id.trim());
      return NextResponse.json({ session });
    }

    return NextResponse.json(
      { error: 'A valid maxCapacity or action=close is required.' },
      { status: 400 },
    );
  } catch (error) {
    console.error('Failed to update bake session:', error);

    if (error instanceof Error && error.message.startsWith('Capacity cannot be lower')) {
      return NextResponse.json({ error: error.message }, { status: 409 });
    }

    const message = error instanceof Error ? error.message : 'Failed to update bake session.';

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
