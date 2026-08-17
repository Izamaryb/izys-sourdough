import { classNames } from '@/lib/classNames';

type CheckIconProps = {
  className?: string;
};

export function CheckIcon({ className }: CheckIconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className={classNames('h-4 w-4', className)}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        d="M20.707 5.293a1 1 0 010 1.414l-11 11a1 1 0 01-1.414 0l-5-5a1 1 0 011.414-1.414L9 15.586 19.293 5.293a1 1 0 011.414 0z"
        clipRule="evenodd"
      />
    </svg>
  );
}
