import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Phone, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PhoneAuthFormProps {
  onSuccess?: (user: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function PhoneAuthForm({ onSuccess, onError, className }: PhoneAuthFormProps) {
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [loading, setLoading] = useState(false);

  const handleSendOTP = async () => {
    if (!phone.trim()) return;
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
      });

      if (error) {
        console.error('OTP send error:', error);
        onError?.(error);
      } else {
        setStep('otp');
      }
    } catch (error) {
      console.error('OTP send error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otp.trim()) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.verifyOtp({
        phone: phone.startsWith('+') ? phone : `+${phone}`,
        token: otp,
        type: 'sms'
      });

      if (error) {
        console.error('OTP verify error:', error);
        onError?.(error);
      } else {
        console.log('Phone auth success:', data);
        onSuccess?.(data.user);
      }
    } catch (error) {
      console.error('OTP verify error:', error);
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Phone className="h-5 w-5" />
          Phone Authentication
        </CardTitle>
        <CardDescription>
          {step === 'phone' 
            ? 'Enter your phone number to receive OTP'
            : 'Enter the OTP sent to your phone'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {step === 'phone' ? (
          <>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1234567890"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                disabled={loading}
              />
            </div>
            <Button 
              onClick={handleSendOTP} 
              disabled={loading || !phone.trim()}
              className="w-full"
            >
              {loading ? 'Sending...' : 'Send OTP'}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="123456"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={() => setStep('phone')}
                className="flex-1"
              >
                Back
              </Button>
              <Button 
                onClick={handleVerifyOTP} 
                disabled={loading || !otp.trim()}
                className="flex-1"
              >
                {loading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
