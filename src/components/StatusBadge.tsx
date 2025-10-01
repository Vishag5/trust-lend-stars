import { Badge } from '@/components/ui/badge';
import { ContractStatus } from '@/lib/dataClient';

interface StatusBadgeProps {
  status: ContractStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const variants: Record<ContractStatus, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
    REQUESTED: { variant: 'secondary', label: 'Requested' },
    ACTIVE: { variant: 'default', label: 'Active' },
    SETTLE_PENDING: { variant: 'outline', label: 'Settle Pending' },
    SETTLED: { variant: 'outline', label: 'Settled' },
  };

  const { variant, label } = variants[status];

  return (
    <Badge variant={variant} className="font-medium">
      {label}
    </Badge>
  );
}
