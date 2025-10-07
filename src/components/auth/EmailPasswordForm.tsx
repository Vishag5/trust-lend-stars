import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Mail, Lock, User, Phone } from 'lucide-react';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useToast } from '@/hooks/use-toast';

interface EmailPasswordFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function EmailPasswordForm({ onSuccess, onError, className }: EmailPasswordFormProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    phone: '+91'
  });
  const [loading, setLoading] = useState(false);
  
  const { login, register } = useProductionAuthStore();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      // Login
      setLoading(true);
      try {
        const result = await login(formData.email, formData.password);
        
        if (result.success) {
          const { currentUser } = useProductionAuthStore.getState();
          onSuccess?.(currentUser);
          toast({
            title: 'Login Successful',
            description: 'Welcome back!',
          });
        } else {
          onError?.(new Error(result.error));
          toast({
            title: 'Login Failed',
            description: result.error || 'An error occurred during login',
            variant: 'destructive',
          });
        }
      } catch (error) {
        onError?.(error);
        toast({
          title: 'Login Failed',
          description: 'An error occurred during login',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    } else {
      // Register
      if (formData.password !== formData.confirmPassword) {
        toast({
          title: 'Registration Failed',
          description: 'Passwords do not match',
          variant: 'destructive',
        });
        return;
      }
      
      setLoading(true);
      try {
        const result = await register({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        });
        
        if (result.success) {
          const { currentUser } = useProductionAuthStore.getState();
          onSuccess?.(currentUser);
          toast({
            title: 'Registration Successful',
            description: 'Welcome to LenTrust!',
          });
        } else {
          onError?.(new Error(result.error));
          toast({
            title: 'Registration Failed',
            description: result.error || 'An error occurred during registration',
            variant: 'destructive',
          });
        }
      } catch (error) {
        onError?.(error);
        toast({
          title: 'Registration Failed',
          description: 'An error occurred during registration',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          {isLogin ? 'Sign In' : 'Create Account'}
        </CardTitle>
        <CardDescription>
          {isLogin 
            ? 'Enter your email and password to sign in'
            : 'Create a new account to get started'
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={isLogin ? 'login' : 'register'} onValueChange={(value) => setIsLogin(value === 'login')}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Sign In</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>
          
          <TabsContent value="login" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>
          
          <TabsContent value="register" className="space-y-4">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
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
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <div className="flex">
                    <div className="flex items-center px-3 py-2 text-sm bg-muted border border-r-0 rounded-l-md border-input">
                      +91
                    </div>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="9876543210"
                      value={formData.phone.replace('+91', '')}
                      onChange={(e) => {
                        const phoneValue = e.target.value.replace(/\D/g, ''); // Remove non-digits
                        setFormData(prev => ({ ...prev, phone: '+91' + phoneValue }));
                      }}
                      disabled={loading}
                      required
                      className="rounded-l-none"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">
                  Enter your 10-digit mobile number
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <div className="flex items-center gap-2">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                  <Input
                    id="confirmPassword"
                    type="password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    disabled={loading}
                    required
                  />
                </div>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? 'Creating Account...' : 'Create Account'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
