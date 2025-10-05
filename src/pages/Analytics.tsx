import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import { getDataClient, Contract } from '@/lib/dataClient';
import { MobileHeader } from '@/components/MobileHeader';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { IndianRupee, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatAmount } from '@/lib/format';

export default function Analytics() {
  const navigate = useNavigate();
  const { currentUserId } = useAuthStore();
  const { toast } = useToast();
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUserId) {
      navigate('/');
      return;
    }
    loadAnalytics();
  }, [currentUserId, navigate]);

  const loadAnalytics = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const client = getDataClient();
      const data = await client.getContractsForUser(currentUserId);
      setContracts(data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load analytics data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const getStats = () => {
    const totalLent = contracts
      .filter(c => c.lender_id === currentUserId && c.status === 'SETTLED')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const totalBorrowed = contracts
      .filter(c => c.borrower_id === currentUserId && c.status === 'SETTLED')
      .reduce((sum, c) => sum + c.amount, 0);
    
    const activeLoans = contracts.filter(c => c.status === 'ACTIVE').length;
    const overdueLoans = contracts.filter(c => c.status === 'DUE').length;
    
    const successRate = contracts.filter(c => c.status === 'SETTLED').length / 
      Math.max(contracts.filter(c => c.status !== 'REQUESTED').length, 1) * 100;

    return {
      totalLent,
      totalBorrowed,
      activeLoans,
      overdueLoans,
      successRate: Math.round(successRate)
    };
  };

  const stats = getStats();

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Analytics" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading analytics...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Analytics" showBack />
      
      <main className="flex-1 space-y-4 px-4 py-6">
        {/* Summary Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Lent
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold">{formatAmount(stats.totalLent)}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Borrowed
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-blue-600" />
                <span className="text-2xl font-bold">{formatAmount(stats.totalBorrowed)}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Performance Stats */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Success Rate
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold">{stats.successRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Active Loans
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold">{stats.activeLoans}</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Loan Status Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Loan Status Breakdown</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span>Settled</span>
                </div>
                <span className="font-semibold">
                  {contracts.filter(c => c.status === 'SETTLED').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-blue-600" />
                  <span>Active</span>
                </div>
                <span className="font-semibold">
                  {contracts.filter(c => c.status === 'ACTIVE').length}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <XCircle className="h-4 w-4 text-red-600" />
                  <span>Overdue</span>
                </div>
                <span className="font-semibold">
                  {contracts.filter(c => c.status === 'DUE').length}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {contracts.slice(0, 5).map((contract) => (
                <div key={contract.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{formatAmount(contract.amount)}</p>
                    <p className="text-sm text-muted-foreground">
                      {contract.status === 'SETTLED' ? 'Settled' : 
                       contract.status === 'ACTIVE' ? 'Active' : 
                       contract.status === 'DUE' ? 'Overdue' : 'Requested'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">
                      {new Date(contract.created_at).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
