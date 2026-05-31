import { QualityTag, QualityStatus } from '../types';

export function getQualityStatus(score: number): QualityStatus {
  if (score >= 95) return 'excellent';
  if (score >= 85) return 'good';
  if (score >= 70) return 'warning';
  if (score >= 50) return 'critical';
  return 'destroyed';
}

export function getQualityTag(score: number): QualityTag {
  const status = getQualityStatus(score);

  const tags: Record<QualityStatus, QualityTag> = {
    excellent: {
      status: 'excellent',
      label: 'Excellent Quality',
      description: 'Ready for immediate use',
      color: '#059669',
      bgColor: '#d1fae5',
      borderColor: '#6ee7b7'
    },
    good: {
      status: 'good',
      label: 'Good Quality',
      description: 'Suitable for use',
      color: '#0891b2',
      bgColor: '#cffafe',
      borderColor: '#67e8f9'
    },
    warning: {
      status: 'warning',
      label: 'Quality Decreased',
      description: 'Use immediately - reduced shelf life',
      color: '#d97706',
      bgColor: '#fef3c7',
      borderColor: '#fcd34d'
    },
    critical: {
      status: 'critical',
      label: 'Critical Condition',
      description: 'Urgent use required - quality compromised',
      color: '#dc2626',
      bgColor: '#fee2e2',
      borderColor: '#fca5a5'
    },
    destroyed: {
      status: 'destroyed',
      label: 'Destroyed',
      description: 'Dispose immediately - not suitable for use',
      color: '#7f1d1d',
      bgColor: '#fecaca',
      borderColor: '#dc2626'
    }
  };

  return tags[status];
}
