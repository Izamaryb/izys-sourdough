import type { PickupDateOption, PickupSlot } from './types';

export type VacationRange = {
  enabled: boolean;
  startDate: string | null;
  endDate: string | null;
};

const WEDNESDAY = 3;
const DAY_IN_MS = 24 * 60 * 60 * 1000;
const blackoutDates = new Set(['2026-12-24']);
const reservedSlotsByDate: Record<string, string[]> = {
  '2026-06-17': ['4:30 PM', '5:15 PM'],
  '2026-06-24': ['4:00 PM'],
};

function isDateInVacationRange(dateValue: string, vacation?: VacationRange | null): boolean {
  if (!vacation?.enabled) {
    return false;
  }

  if (vacation.startDate && dateValue < vacation.startDate) {
    return false;
  }

  if (vacation.endDate && dateValue > vacation.endDate) {
    return false;
  }

  return true;
}

function startOfDay(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function formatDateValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateLabel(date: Date) {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function getNextWednesday(fromDate: Date) {
  const date = startOfDay(fromDate);
  const daysUntilWednesday = (WEDNESDAY - date.getDay() + 7) % 7;
  date.setDate(date.getDate() + daysUntilWednesday);

  return date;
}

function getDateStatus(
  date: Date,
  today: Date,
  vacation?: VacationRange | null,
): PickupDateOption['status'] {
  const dateValue = formatDateValue(date);
  const pickupStart = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
  const cutoffTime = new Date(pickupStart.getTime() - 48 * 60 * 60 * 1000);

  if (startOfDay(date).getTime() < startOfDay(today).getTime()) {
    return 'past';
  }

  if (isDateInVacationRange(dateValue, vacation)) {
    return 'vacation';
  }

  if (blackoutDates.has(dateValue)) {
    return 'blackout';
  }

  if (today.getTime() > cutoffTime.getTime()) {
    return 'cutoff';
  }

  return 'available';
}

function getHelperText(status: PickupDateOption['status']) {
  if (status === 'available') {
    return 'Available for preorder';
  }

  if (status === 'vacation') {
    return 'Bakery is on vacation this week';
  }

  if (status === 'blackout') {
    return 'Unavailable this week';
  }

  if (status === 'cutoff') {
    return '48-hour cutoff has passed';
  }

  return 'Past pickup date';
}

export function getPickupDateOptions(
  today = new Date(),
  vacation?: VacationRange | null,
): PickupDateOption[] {
  const firstWednesday = getNextWednesday(today);

  return Array.from({ length: 5 }, (_, index) => {
    const date = new Date(firstWednesday);
    date.setDate(firstWednesday.getDate() + index * 7);
    const status = getDateStatus(date, today, vacation);

    return {
      date,
      value: formatDateValue(date),
      label: formatDateLabel(date),
      status,
      helperText: getHelperText(status),
    };
  });
}

export function getPickupSlots(dateValue: string): PickupSlot[] {
  const reservedSlots = new Set(reservedSlotsByDate[dateValue] ?? []);
  const startHour = 16;

  return Array.from({ length: 20 }, (_, index) => {
    const totalMinutes = startHour * 60 + index * 15;
    const hour = Math.floor(totalMinutes / 60);
    const minute = totalMinutes % 60;
    const displayHour = hour > 12 ? hour - 12 : hour;
    const label = `${displayHour}:${String(minute).padStart(2, '0')} PM`;

    return {
      value: label,
      label,
      reserved: reservedSlots.has(label),
    };
  });
}
