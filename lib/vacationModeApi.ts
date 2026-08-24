import type { VacationRange } from '@/components/pickup';

export type VacationModeApiResponse = {
  vacationMode: VacationRange;
};

export type ApiErrorResponse = {
  error: string;
};

export async function fetchVacationMode(): Promise<VacationRange> {
  const response = await fetch('/api/settings/vacation-mode', {
    cache: 'no-store',
  });
  const data = (await response.json()) as VacationModeApiResponse | ApiErrorResponse;

  if (!response.ok || !('vacationMode' in data)) {
    const message = 'error' in data ? data.error : 'Failed to load vacation mode';
    throw new Error(message);
  }

  return data.vacationMode;
}
