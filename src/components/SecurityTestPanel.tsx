import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Alert, AlertDescription } from './ui/alert';
import { CheckCircle, XCircle, Shield, AlertTriangle } from 'lucide-react';
import { runSecurityTests, SecurityTestResult } from '@/lib/securityTestRunner';
import { runBrowserSecurityTests, BrowserSecurityTestResult } from '@/lib/browserSecurityTest';

interface SecurityTestPanelProps {
  onTestComplete?: (results: SecurityTestResult[]) => void;
}

export const SecurityTestPanel: React.FC<SecurityTestPanelProps> = ({ onTestComplete }) => {
  const [isRunning, setIsRunning] = useState(false);
  const [results, setResults] = useState<SecurityTestResult[]>([]);
  const [summary, setSummary] = useState({ total: 0, passed: 0, failed: 0, percentage: 0 });

  const runTests = async () => {
    setIsRunning(true);
    setResults([]);
    
    try {
      console.log('🔒 Starting Automated Security Tests...');
      
      // Run both test suites
      const [serverTests, browserTests] = await Promise.all([
        runSecurityTests(),
        runBrowserSecurityTests()
      ]);
      
      // Combine results
      const allResults = [...serverTests, ...browserTests];
      setResults(allResults);
      
      // Calculate summary
      const total = allResults.length;
      const passed = allResults.filter(r => r.passed).length;
      const failed = total - passed;
      const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
      
      setSummary({ total, passed, failed, percentage });
      
      if (onTestComplete) {
        onTestComplete(allResults);
      }
      
      console.log(`✅ Security Tests Complete: ${passed}/${total} passed (${percentage}%)`);
      console.log(`📊 Server Tests: ${serverTests.filter(r => r.passed).length}/${serverTests.length} passed`);
      console.log(`🌐 Browser Tests: ${browserTests.filter(r => r.passed).length}/${browserTests.length} passed`);
    } catch (error) {
      console.error('❌ Security Tests Failed:', error);
    } finally {
      setIsRunning(false);
    }
  };

  const getStatusIcon = (passed: boolean) => {
    return passed ? (
      <CheckCircle className="h-4 w-4 text-green-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  const getStatusBadge = (passed: boolean) => {
    return passed ? (
      <Badge variant="default" className="bg-green-500">PASS</Badge>
    ) : (
      <Badge variant="destructive">FAIL</Badge>
    );
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-500" />
            Security Test Suite
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Test Controls */}
          <div className="flex items-center gap-4">
            <Button 
              onClick={runTests} 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isRunning ? 'Running Tests...' : 'Run Security Tests'}
            </Button>
            
            {summary.total > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <Progress value={summary.percentage} className="w-32" />
                <span className="text-sm font-medium">{summary.percentage}%</span>
              </div>
            )}
          </div>

          {/* Test Summary */}
          {summary.total > 0 && (
            <Alert className={summary.percentage >= 80 ? 'border-green-200 bg-green-50' : 'border-yellow-200 bg-yellow-50'}>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                <div className="flex items-center justify-between">
                  <span>
                    Security Tests: <strong>{summary.passed}/{summary.total}</strong> passed
                  </span>
                  <div className="flex gap-2">
                    <Badge variant="default" className="bg-green-500">
                      {summary.passed} Passed
                    </Badge>
                    <Badge variant="destructive">
                      {summary.failed} Failed
                    </Badge>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Test Results */}
          {results.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Test Results:</h4>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`p-3 rounded-lg border ${
                      result.passed 
                        ? 'border-green-200 bg-green-50' 
                        : 'border-red-200 bg-red-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(result.passed)}
                        <span className="font-medium text-sm">{result.testName}</span>
                      </div>
                      {getStatusBadge(result.passed)}
                    </div>
                    <p className="text-xs text-gray-600 mt-1">{result.message}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Security Status */}
          {summary.total > 0 && (
            <div className="text-center">
              {summary.percentage >= 80 ? (
                <div className="text-green-600 font-medium">
                  ✅ Security Status: GOOD ({summary.percentage}% passed)
                </div>
              ) : (
                <div className="text-red-600 font-medium">
                  ⚠️ Security Status: NEEDS ATTENTION ({summary.percentage}% passed)
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
