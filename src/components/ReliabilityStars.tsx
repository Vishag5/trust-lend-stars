import { Star } from 'lucide-react';
import { ReliabilityData } from '@/lib/reliability';

interface ReliabilityStarsProps {
  score?: number;
  reliability?: ReliabilityData;
  showTooltip?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function ReliabilityStars({ 
  score, 
  reliability, 
  showTooltip = false, 
  size = 'md' 
}: ReliabilityStarsProps) {
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

  // If we have a reliability object, use it
  if (reliability) {
    if (reliability.isNew) {
      return (
        <div className="flex items-center gap-2">
          <span className={`font-medium text-muted-foreground ${textSizeClasses[size]}`}>
            Trust Score: New — no history yet
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
          {reliability.percentage}% Trust Score
        </span>
        {showTooltip && !reliability.isNew && (
          <span className={`text-muted-foreground ${textSizeClasses[size]}`}>
            ({reliability.numerator}/{reliability.denominator} repaid in last 12 months)
          </span>
        )}
      </div>
    );
  }

  // If we only have a score, convert it to stars
  if (score !== undefined && score !== null) {
    const stars = Math.round((score / 100) * 5); // Convert percentage to 1-5 stars

    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`${sizeClasses[size]} ${
                star <= stars ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-300 text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className={`font-semibold text-foreground ${textSizeClasses[size]}`}>
          {score}% Trust Score
        </span>
      </div>
    );
  }

  // Fallback for no data
  return (
    <div className="flex items-center gap-2">
      <span className={`font-medium text-muted-foreground ${textSizeClasses[size]}`}>
        No trust score data
      </span>
    </div>
  );
}