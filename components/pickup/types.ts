export type PickupDateOption = {
  date: Date;
  value: string;
  label: string;
  status: 'available' | 'cutoff' | 'blackout' | 'past' | 'vacation';
  helperText: string;
};

export type PickupSlot = {
  value: string;
  label: string;
  reserved: boolean;
};
