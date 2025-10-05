import { Badge } from '@/components/ui/badge';
import { ContractStatus } from '@/lib/dataClient';

interface StatusBadgeProps {
  status: ContractStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<ContractStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string; className?: string }> = {
    REQUESTED: { variant: 'secondary', label: 'Requested' },
    PENDING_DISBURSAL: { variant: 'secondary', label: 'Awaiting Proof', className: 'bg-orange-500 text-white border-orange-500 whitespace-nowrap' },
    ACTIVE: { variant: 'default', label: 'Active' },
    DUE: { variant: 'destructive', label: 'Due' },
    PENDING_SETTLEMENT: { variant: 'secondary', label: 'Awaiting Settlement', className: 'bg-orange-500 text-white border-orange-500 whitespace-nowrap' },
    SETTLED: { variant: 'outline', label: 'Settled' },
    REJECTED: { variant: 'destructive', label: 'Rejected' },
  };

  const { variant, label, className } = variants[status];

  return (
    <Badge variant={variant} className={`font-medium text-xs px-2 py-1 ${className || ''}`}>
      {label}
    </Badge>
  );
}
