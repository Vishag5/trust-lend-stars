import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Switch } from './ui/switch';
import { Label } from './ui/label';
import { Settings, Shield, Users, TestTube } from 'lucide-react';
import { useFeatureFlag } from '@/hooks/useFeatureFlag';

interface AdminModeToggleProps {
  currentMode: 'demo' | 'production';
  onModeChange: (mode: 'demo' | 'production') => void;
  className?: string;
}

export function AdminModeToggle({ currentMode, onModeChange, className }: AdminModeToggleProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Feature flags
  const showSecurityTests = useFeatureFlag('securityTests');
  const showUIUXTests = useFeatureFlag('uiuxTests');
  const showDebugPanel = useFeatureFlag('debugPanel');

  const handleModeToggle = (checked: boolean) => {
    onModeChange(checked ? 'demo' : 'production');
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Admin Controls
        </CardTitle>
        <CardDescription>
          Switch between demo and production modes for testing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Mode Toggle */}
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <Label htmlFor="mode-toggle" className="text-sm font-medium">
              Application Mode
            </Label>
            <div className="flex items-center gap-2">
              <Badge variant={currentMode === 'demo' ? 'default' : 'secondary'}>
                {currentMode === 'demo' ? 'Demo Mode' : 'Production Mode'}
              </Badge>
            </div>
          </div>
          <Switch
            id="mode-toggle"
            checked={currentMode === 'demo'}
            onCheckedChange={handleModeToggle}
          />
        </div>

        {/* Mode Description */}
        <div className="text-sm text-muted-foreground">
          {currentMode === 'demo' ? (
            <div className="flex items-center gap-2">
              <TestTube className="h-4 w-4" />
              <span>Demo mode: Shows test data and debug panels</span>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>Production mode: Real user experience</span>
            </div>
          )}
        </div>

        {/* Expandable Admin Features */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          <Settings className="h-4 w-4 mr-2" />
          {isExpanded ? 'Hide' : 'Show'} Admin Features
        </Button>

        {isExpanded && (
          <div className="space-y-3 pt-2 border-t">
            <div className="text-sm font-medium">Available Features:</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${showSecurityTests ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Security Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${showUIUXTests ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>UI/UX Tests</span>
              </div>
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${showDebugPanel ? 'bg-green-500' : 'bg-gray-300'}`} />
                <span>Debug Panel</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500" />
                <span>Mode Toggle</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
