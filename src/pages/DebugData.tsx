import { useEffect, useState } from 'react';
import { getDataClient, User } from '@/lib/dataClient';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MobileHeader } from '@/components/MobileHeader';

export default function DebugData() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      console.log('Loading debug data...');
      const client = getDataClient();
      const usersData = await client.getUsers();
      console.log('Debug - Users loaded:', usersData);
      setUsers(usersData);
    } catch (error) {
      console.error('Debug - Error loading data:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const clearData = () => {
    localStorage.clear();
    setUsers([]);
    console.log('Debug - Data cleared');
  };

  const seedData = async () => {
    try {
      console.log('Debug - Seeding data...');
      const client = getDataClient();
      await client.getUsers(); // This will trigger ensureDemoData
      await loadData();
    } catch (error) {
      console.error('Debug - Error seeding data:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen flex-col">
        <MobileHeader title="Debug Data" showBack />
        <main className="flex flex-1 items-center justify-center">
          <p className="text-muted-foreground">Loading debug data...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-muted/30">
      <MobileHeader title="Debug Data" showBack />
      
      <main className="flex-1 px-4 py-6">
        <Card className="p-6 mb-6">
          <h1 className="text-2xl font-bold mb-4">Debug Data</h1>
          
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={loadData}>Reload Data</Button>
              <Button onClick={seedData} variant="outline">Seed Data</Button>
              <Button onClick={clearData} variant="destructive">Clear Data</Button>
            </div>
            
            {error && (
              <div className="p-3 bg-red-100 border border-red-300 rounded">
                <p className="text-red-800">Error: {error}</p>
              </div>
            )}
            
            <div>
              <h2 className="text-lg font-semibold mb-2">Users ({users.length})</h2>
              {users.length === 0 ? (
                <p className="text-muted-foreground">No users found</p>
              ) : (
                <div className="space-y-2">
                  {users.map(user => (
                    <div key={user.id} className="p-3 bg-muted rounded">
                      <p><strong>ID:</strong> {user.id}</p>
                      <p><strong>Name:</strong> {user.name}</p>
                      <p><strong>Phone:</strong> {user.phone}</p>
                      <p><strong>Reliability:</strong> {user.trust_reliability_cached}%</p>
                      <p><strong>Created:</strong> {new Date(user.created_at).toLocaleString()}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </Card>
      </main>
    </div>
  );
}
