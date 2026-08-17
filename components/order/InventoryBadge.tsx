import { classNames } from '@/lib/classNames';

export type InventoryStatus = 'available' | 'low' | 'sold-out';

type InventoryBadgeProps = {
  status: InventoryStatus;
};

const labels: Record<InventoryStatus, string> = {
  available: 'Available',
  low: 'Low Inventory',
  'sold-out': 'Sold Out',
};

const badgeClasses: Record<InventoryStatus, string> = {
  available: 'border-surfaceBorder bg-background/95 text-primary',
  low: 'border-button bg-background/95 text-primary',
  'sold-out': 'border-primary bg-primary/85 text-button-text',
};

export function InventoryBadge({ status }: InventoryBadgeProps) {
  return (
    <span
      className={classNames(
        'inline-flex rounded-lg border px-3 py-1.5 font-body text-small font-medium shadow-card backdrop-blur',
        badgeClasses[status],
      )}
    >
      {labels[status]}
    </span>
  );
}
