'use client';

import { cn } from '@/lib/utils';

interface EnergyBarProps {
  readonly energyBudget: number | null;
  readonly remainingEnergy?: number | null;
}

const MAX_ENERGY = 120;

/**
 * Get color class based on remaining energy percentage of budget
 */
function getEnergyColor(remaining: number, budget: number): string {
  if (budget <= 0) return 'bg-muted';
  const percentage = (remaining / budget) * 100;
  if (percentage >= 70) return 'bg-green-500';
  if (percentage >= 40) return 'bg-yellow-500';
  return 'bg-red-500';
}

export function EnergyBar({ energyBudget, remainingEnergy }: EnergyBarProps) {
  if (energyBudget === null) {
    return null;
  }

  const remaining = remainingEnergy ?? energyBudget;
  const max = energyBudget > 0 ? energyBudget : MAX_ENERGY;
  const percentage = Math.min((remaining / max) * 100, 100);
  const colorClass = getEnergyColor(remaining, max);

  return (
    <div
      id='energy-bar'
      className='hidden sm:flex items-center gap-2 min-w-[120px]'
    >
      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden relative'>
        <progress
          value={remaining}
          max={max}
          className='sr-only'
          aria-label={`Energy: ${remaining} left of ${max}`}
        />
        <div
          className={cn('h-full transition-all duration-300', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
        {remaining}
        {energyBudget > 0 ? ` / ${energyBudget}` : ''}
      </span>
    </div>
  );
}
