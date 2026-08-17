'use client';

import { CheckIcon } from './CheckIcon';
import { classNames } from '@/lib/classNames';

export type StepStatus = 'completed' | 'active' | 'upcoming';

type Step = {
  label: string;
  status: StepStatus;
};

type CheckoutStepProgressProps = {
  steps: Step[];
};

const wrapperClasses = 'border-b border-surfaceBorder bg-background';
const containerClasses = 'layout-container flex items-center gap-0 py-5';
const stepCircleBase =
  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 font-body text-small font-medium transition-colors';
const completedCircleClasses = 'border-button bg-button text-button-text';
const activeCircleClasses = 'border-button bg-background text-button';
const upcomingCircleClasses = 'border-accent bg-background text-accent';
const labelBase = 'ml-2 font-body text-small font-medium';
const completedLabelClasses = 'text-primary';
const activeLabelClasses = 'text-primary';
const upcomingLabelClasses = 'text-secondary';
const connectorBase = 'mx-3 h-0.5 w-8 sm:w-12';
const completedConnectorClasses = 'bg-button';
const upcomingConnectorClasses = 'bg-accent';

function getCircleClasses(status: StepStatus) {
  if (status === 'completed') return completedCircleClasses;
  if (status === 'active') return activeCircleClasses;
  return upcomingCircleClasses;
}

function getLabelClasses(status: StepStatus) {
  if (status === 'completed') return completedLabelClasses;
  if (status === 'active') return activeLabelClasses;
  return upcomingLabelClasses;
}

export function CheckoutStepProgress({ steps }: CheckoutStepProgressProps) {
  return (
    <div className={wrapperClasses}>
      <nav aria-label="Checkout progress" className={containerClasses}>
        {steps.map((step, index) => (
          <div key={step.label} className="flex items-center">
            {index > 0 && (
              <span
                className={classNames(
                  connectorBase,
                  step.status === 'upcoming' ? upcomingConnectorClasses : completedConnectorClasses,
                )}
                aria-hidden="true"
              />
            )}
            <span className="flex items-center">
              <span className={classNames(stepCircleBase, getCircleClasses(step.status))}>
                {step.status === 'completed' ? (
                  <CheckIcon className="h-4 w-4" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </span>
              <span className={classNames(labelBase, getLabelClasses(step.status))}>
                {step.label}
              </span>
            </span>
          </div>
        ))}
      </nav>
    </div>
  );
}
