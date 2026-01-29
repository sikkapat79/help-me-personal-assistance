'use client';

import { cn } from '@/lib/utils';

interface EnergyBarProps {
  readonly energyBudget: number | null;
}

const MAX_ENERGY = 120; // Maximum energy budget range

/**
 * Get color class based on energy level
 */
function getEnergyColor(energy: number): string {
  const percentage = (energy / MAX_ENERGY) * 100;
  if (percentage >= 70) {
    return 'bg-green-500';
  } else if (percentage >= 40) {
    return 'bg-yellow-500';
  } else {
    return 'bg-red-500';
  }
}

export function EnergyBar({ energyBudget }: EnergyBarProps) {
  if (energyBudget === null) {
    return null; // Hide if no check-in
  }

  const percentage = Math.min((energyBudget / MAX_ENERGY) * 100, 100);
  const colorClass = getEnergyColor(energyBudget);

  return (
    <div
      id='energy-bar'
      className='hidden sm:flex items-center gap-2 min-w-[120px]'
    >
      {/* Progress bar */}
      <div className='flex-1 h-2 bg-muted rounded-full overflow-hidden relative'>
        <progress
          value={energyBudget}
          max={MAX_ENERGY}
          className='sr-only'
          aria-label={`Energy budget: ${energyBudget} out of ${MAX_ENERGY}`}
        />
        <div
          className={cn('h-full transition-all duration-300', colorClass)}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Number label */}
      <span className='text-xs font-medium text-muted-foreground whitespace-nowrap'>
        {energyBudget}
      </span>
    </div>
  );
}
