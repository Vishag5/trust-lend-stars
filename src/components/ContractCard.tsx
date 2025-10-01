import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Contract } from '@/lib/dataClient';
import { StatusBadge } from './StatusBadge';
import { formatAmount, formatDateTime, formatPhone, getTimeUntilDue } from '@/lib/format';
import { useNavigate } from 'react-router-dom';
import { Clock, User } from 'lucide-react';

interface ContractCardProps {
  contract: Contract;
  currentUserId: string;
  onUpdate: () => void;
  showActions?: boolean;
}

export function ContractCard({ contract, currentUserId, onUpdate, showActions = false }: ContractCardProps) {
  const navigate = useNavigate();
  const isBorrower = contract.borrower_id === currentUserId;
  const isLender = contract.lender_id === currentUserId;
  const otherParty = isBorrower ? contract.lender : contract.borrower;

  return (
    <Card className="cursor-pointer transition-shadow hover:shadow-md" onClick={() => navigate(`/contract/${contract.id}`)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">
                {otherParty?.name || 'Unknown'}
              </span>
              {isLender && otherParty && (
                <span className="text-sm text-muted-foreground">
                  {formatPhone(otherParty.phone, true)}
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground">
              {isBorrower ? 'Borrowed from' : 'Lent to'} {otherParty?.name || 'Unknown'}
            </p>
          </div>
          <StatusBadge status={contract.status} />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-3xl font-bold text-primary">{formatAmount(contract.amount)}</span>
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{getTimeUntilDue(contract.due_at)}</span>
          </div>
        </div>
        
        <div className="space-y-1 text-sm">
          <p className="text-muted-foreground">
            Due: {formatDateTime(contract.due_at)}
          </p>
          {contract.reason && (
            <p className="text-muted-foreground">Reason: {contract.reason}</p>
          )}
        </div>

        {showActions && isBorrower && (contract.status === 'ACTIVE' || contract.status === 'DUE') && (
          <div className="flex gap-2 pt-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={(e) => { 
                e.stopPropagation(); 
              }}
            >
              <Clock className="mr-2 h-4 w-4" />
              Ask for Extension
            </Button>
            <Button 
              size="sm" 
              className="flex-1 bg-success hover:bg-success/90"
              onClick={(e) => { 
                e.stopPropagation(); 
              }}
            >
              Settle Up
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
