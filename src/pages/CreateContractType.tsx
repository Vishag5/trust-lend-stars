import { useNavigate } from 'react-router-dom';
import { Card, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { DollarSign, Package, Briefcase, ArrowLeft } from 'lucide-react';

export default function CreateContractType() {
  const navigate = useNavigate();

  const contractTypes = [
    {
      type: 'money',
      title: 'Lend / Borrow Money',
      description: 'Create an agreement for lending or borrowing money with repayment terms',
      icon: DollarSign,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
    },
    {
      type: 'item',
      title: 'Lend / Borrow an Item',
      description: 'Create an agreement for lending or borrowing physical items with return conditions',
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
    },
    {
      type: 'service',
      title: 'Work / Service Agreement',
      description: 'Create a service contract with milestones and payment terms',
      icon: Briefcase,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button
        variant="ghost"
        onClick={() => navigate('/dashboard')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Dashboard
      </Button>

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create New Agreement</h1>
        <p className="text-muted-foreground">
          Choose the type of agreement you want to create
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        {contractTypes.map((contractType) => {
          const Icon = contractType.icon;
          return (
            <Card
              key={contractType.type}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(`/create/${contractType.type}`)}
            >
              <CardHeader className="flex flex-row items-start space-y-0 gap-4">
                <div className={`p-3 rounded-lg ${contractType.bgColor}`}>
                  <Icon className={`h-8 w-8 ${contractType.color}`} />
                </div>
                <div className="flex-1">
                  <CardTitle className="text-xl mb-2">{contractType.title}</CardTitle>
                  <CardDescription className="text-base">
                    {contractType.description}
                  </CardDescription>
                </div>
              </CardHeader>
            </Card>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <p className="text-sm text-muted-foreground">
          <strong>Note:</strong> All agreements use a proof-based verification system. 
          Both parties must approve key actions (disbursal/handover and repayment/return) 
          for the agreement to progress.
        </p>
      </div>
    </div>
  );
}
