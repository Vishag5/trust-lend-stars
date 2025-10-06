import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { User, Phone, Mail } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface UserOnboardingProps {
  user: any;
  onComplete?: (userData: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function UserOnboarding({ user, onComplete, onError, className }: UserOnboardingProps) {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.phone.trim()) return;

    setLoading(true);
    try {
      // Create user profile in our users table
      const { data, error } = await supabase
        .from('users')
        .upsert({
          id: user.id,
          name: formData.name,
          phone: formData.phone,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.error('User creation error:', error);
        onError?.(error);
      } else {
        console.log('User profile created:', data);
        onComplete?.(data);
      }
    } catch (error) {
      console.error('User creation error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Complete Your Profile
        </CardTitle>
        <CardDescription>
          Help us set up your account with some basic information
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Full Name *</Label>
            <Input
              id="name"
              type="text"
              placeholder="Enter your full name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              disabled={loading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Phone Number *</Label>
            <div className="flex items-center gap-2">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                disabled={loading}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address</Label>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                value={formData.email}
                disabled
                className="bg-muted"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Email is automatically set from your authentication provider
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={loading || !formData.name.trim() || !formData.phone.trim()}
            className="w-full"
          >
            {loading ? 'Creating Profile...' : 'Complete Setup'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
