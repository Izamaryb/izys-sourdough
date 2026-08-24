import { prisma } from './prisma';
import { isVacationModeActive } from './settings';

const START_HOUR = 16;
const SLOT_COUNT = 20;
const INTERVAL_MINUTES = 15;
const DEFAULT_CAPACITY = 1;

type PrismaTransaction = Omit<
  typeof prisma,
  '$connect' | '$disconnect' | '$on' | '$transaction' | '$use' | '$extends'
>;

export class PickupSlotFullError extends Error {
  constructor(timeValue: string) {
    super(`Pickup slot ${timeValue} is fully reserved.`);
    this.name = 'PickupSlotFullError';
  }
}

export class PickupSlotDisabledError extends Error {
  constructor(timeValue: string) {
    super(`Pickup slot ${timeValue} is not available.`);
    this.name = 'PickupSlotDisabledError';
  }
}

export type PickupSlotAvailability = {
  value: string;
  label: string;
  reserved: boolean;
  capacity: number;
  orderCount: number;
  isEnabled: boolean;
};

function formatPickupTimeLabel(totalMinutes: number): string {
  const hour = Math.floor(totalMinutes / 60);
  const minute = totalMinutes % 60;
  const displayHour = hour > 12 ? hour - 12 : hour;

  return `${displayHour}:${String(minute).padStart(2, '0')} PM`;
}

export async function getPickupSlotsWithAvailability(
  dateValue: string,
): Promise<PickupSlotAvailability[]> {
  const [slotRecords, isOnVacation] = await Promise.all([
    prisma.pickupSlot.findMany({ where: { date: dateValue } }),
    isVacationModeActive(dateValue),
  ]);

  const recordsByTime = new Map(slotRecords.map((record) => [record.time, record]));

  return Array.from({ length: SLOT_COUNT }, (_, index) => {
    const totalMinutes = START_HOUR * 60 + index * INTERVAL_MINUTES;
    const label = formatPickupTimeLabel(totalMinutes);
    const record = recordsByTime.get(label);
    const orderCount = record?.orderCount ?? 0;
    const capacity = record?.capacity ?? DEFAULT_CAPACITY;
    const isEnabled = record?.isEnabled ?? true;

    return {
      value: label,
      label,
      reserved: isOnVacation || !isEnabled || orderCount >= capacity,
      capacity,
      orderCount,
      isEnabled,
    };
  });
}

export type PickupSlotConfigUpdate = {
  capacity?: number;
  isEnabled?: boolean;
};

export async function upsertPickupSlotConfig(
  dateValue: string,
  timeValue: string,
  update: PickupSlotConfigUpdate,
) {
  const existingSlot = await prisma.pickupSlot.findUnique({
    where: {
      date_time: {
        date: dateValue,
        time: timeValue,
      },
    },
  });

  const capacity = update.capacity ?? existingSlot?.capacity ?? DEFAULT_CAPACITY;
  const isEnabled = update.isEnabled ?? existingSlot?.isEnabled ?? true;

  if (existingSlot && existingSlot.orderCount > capacity) {
    throw new Error(
      `Capacity cannot be lower than the current order count (${existingSlot.orderCount}).`,
    );
  }

  return prisma.pickupSlot.upsert({
    where: {
      date_time: {
        date: dateValue,
        time: timeValue,
      },
    },
    update: { capacity, isEnabled },
    create: {
      date: dateValue,
      time: timeValue,
      capacity,
      isEnabled,
      orderCount: 0,
    },
  });
}

export async function reservePickupSlot(
  dateValue: string,
  timeValue: string,
  tx: PrismaTransaction = prisma,
): Promise<void> {
  if (await isVacationModeActive(dateValue)) {
    throw new Error(`Pickup slot ${timeValue} is not available because the bakery is on vacation.`);
  }

  const existingSlot = await tx.pickupSlot.findUnique({
    where: {
      date_time: {
        date: dateValue,
        time: timeValue,
      },
    },
  });

  if (existingSlot) {
    if (!existingSlot.isEnabled) {
      throw new PickupSlotDisabledError(timeValue);
    }

    const result = await tx.pickupSlot.updateMany({
      where: {
        id: existingSlot.id,
        orderCount: { lt: existingSlot.capacity },
      },
      data: { orderCount: { increment: 1 } },
    });

    if (result.count === 0) {
      throw new PickupSlotFullError(timeValue);
    }

    return;
  }

  await tx.pickupSlot.create({
    data: {
      date: dateValue,
      time: timeValue,
      capacity: DEFAULT_CAPACITY,
      orderCount: 1,
    },
  });
}

export async function releasePickupSlot(
  dateValue: string,
  timeValue: string,
  tx: PrismaTransaction = prisma,
): Promise<void> {
  const existingSlot = await tx.pickupSlot.findUnique({
    where: {
      date_time: {
        date: dateValue,
        time: timeValue,
      },
    },
  });

  if (!existingSlot || existingSlot.orderCount <= 0) {
    return;
  }

  await tx.pickupSlot.update({
    where: { id: existingSlot.id },
    data: { orderCount: { decrement: 1 } },
  });
}
