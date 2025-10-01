import { Star } from 'lucide-react';
import { ReliabilityData } from '@/lib/reliability';

interface ReliabilityStarsProps {
  reliability: ReliabilityData;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReliabilityStars({ reliability, showTooltip = false, size = 'md' }: ReliabilityStarsProps) {
  const sizeClasses = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  };

  if (reliability.isNew) {
    return (
      <div className="flex items-center gap-2">
        <span className={`font-medium text-muted-foreground ${textSizeClasses[size]}`}>
          Reliability: New — no history yet
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= reliability.stars ? 'fill-star text-star' : 'fill-muted text-muted'
            }`}
          />
        ))}
      </div>
      <span className={`font-semibold text-foreground ${textSizeClasses[size]}`}>
        {reliability.label}
      </span>
      {showTooltip && !reliability.isNew && (
        <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
          ({reliability.numerator}/{reliability.denominator} repaid in last 12 months)
        </span>
      )}
    </div>
  );
}
