import { getQualityTag } from '../utils/qualityUtils';
import { AlertTriangle, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

interface QualityBadgeProps {
  score: number;
  showDescription?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export default function QualityBadge({ score, showDescription = false, size = 'md' }: QualityBadgeProps) {
  const tag = getQualityTag(score);

  const icons = {
    excellent: CheckCircle2,
    good: CheckCircle2,
    warning: AlertTriangle,
    critical: AlertCircle,
    destroyed: XCircle
  };

  const Icon = icons[tag.status];

  const sizeClasses = {
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  return (
    <div className="inline-block">
      <div
        className={`rounded-lg border ${sizeClasses[size]} font-medium flex items-center gap-2`}
        style={{
          backgroundColor: tag.bgColor,
          borderColor: tag.borderColor,
          color: tag.color
        }}
      >
        <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-4 h-4'} />
        <span>{tag.label}</span>
      </div>
      {showDescription && (
        <p className="text-xs text-muted-foreground mt-1">{tag.description}</p>
      )}
    </div>
  );
}
