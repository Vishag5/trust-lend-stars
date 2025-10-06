import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { runSecurityTests } from '@/lib/securityTests';

export function SecurityTestRunner() {
  const [testResults, setTestResults] = useState<any>(null);
  const [isRunning, setIsRunning] = useState(false);

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const results = await runSecurityTests();
      setTestResults(results);
    } catch (error) {
      console.error('Security tests failed:', error);
      setTestResults({ error: 'Tests failed to run' });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card className="p-4 m-4">
      <h3 className="text-lg font-semibold mb-4">🔒 Security Test Runner</h3>
      
      <Button 
        onClick={handleRunTests} 
        disabled={isRunning}
        className="mb-4"
      >
        {isRunning ? 'Running Tests...' : 'Run Security Tests'}
      </Button>
      
      {testResults && (
        <div className="space-y-2">
          <h4 className="font-medium">Test Results:</h4>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div className={`p-2 rounded ${testResults.fileUpload ? 'bg-green-100' : 'bg-red-100'}`}>
              File Upload: {testResults.fileUpload ? '✅ PASS' : '❌ FAIL'}
            </div>
            <div className={`p-2 rounded ${testResults.inputValidation ? 'bg-green-100' : 'bg-red-100'}`}>
              Input Validation: {testResults.inputValidation ? '✅ PASS' : '❌ FAIL'}
            </div>
            <div className={`p-2 rounded ${testResults.rateLimiting ? 'bg-green-100' : 'bg-red-100'}`}>
              Rate Limiting: {testResults.rateLimiting ? '✅ PASS' : '❌ FAIL'}
            </div>
            <div className={`p-2 rounded ${testResults.environment ? 'bg-green-100' : 'bg-red-100'}`}>
              Environment: {testResults.environment ? '✅ PASS' : '❌ FAIL'}
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
