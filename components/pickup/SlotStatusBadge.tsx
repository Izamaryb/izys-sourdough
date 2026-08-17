import { classNames } from '@/lib/classNames';

type SlotStatusBadgeProps = {
  reserved?: boolean;
};

export function SlotStatusBadge({ reserved = false }: SlotStatusBadgeProps) {
  return (
    <span
      className={classNames(
        'rounded-lg border px-2 py-1 font-body text-small font-medium',
        reserved
          ? 'border-surfaceBorder bg-accent/10 text-secondary'
          : 'border-button bg-background text-primary',
      )}
    >
      {reserved ? 'Full' : 'Available'}
    </span>
  );
}
