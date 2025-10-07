import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Progress } from './ui/progress';
import { User, Phone, Mail, MapPin, Briefcase, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/store/authStore';
import { useProductionAuthStore } from '@/store/productionAuthStore';
import { useModeManager } from '@/hooks/useModeManager';
import { useToast } from '@/hooks/use-toast';

interface OnboardingFormProps {
  user: any;
  onComplete?: (userData: any) => void;
  onError?: (error: any) => void;
  className?: string;
}

export function OnboardingForm({ user, onComplete, onError, className }: OnboardingFormProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: user?.email || '',
    location: '',
    occupation: '',
    bio: ''
  });
  const [loading, setLoading] = useState(false);
  
  const { createUserProfile } = useAuthStore();
  const { createUserProfile: prodCreateUserProfile } = useProductionAuthStore();
  const { currentMode } = useModeManager();
  const { toast } = useToast();
  
  // Use appropriate auth store based on mode
  const isDemoMode = currentMode === 'demo';
  const currentCreateUserProfile = isDemoMode ? createUserProfile : prodCreateUserProfile;

  const totalSteps = 3;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name.trim() || !formData.phone.trim()) {
      toast({
        title: 'Validation Error',
        description: 'Name and phone number are required',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      const userData = {
        name: formData.name.trim(),
        phone: formData.phone.trim(),
        email: formData.email.trim() || null,
        location: formData.location.trim() || null,
        occupation: formData.occupation.trim() || null,
        bio: formData.bio.trim() || null,
      };

      await currentCreateUserProfile(userData);
      
      toast({
        title: 'Profile Created',
        description: 'Your profile has been created successfully',
      });
      
      onComplete?.(userData);
    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to create profile. Please try again.',
        variant: 'destructive',
      });
      onError?.(error);
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => updateFormData('name', e.target.value)}
                placeholder="Enter your full name"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => updateFormData('phone', e.target.value)}
                placeholder="Enter your phone number"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateFormData('email', e.target.value)}
                placeholder="Enter your email address"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => updateFormData('location', e.target.value)}
                placeholder="Enter your city or location"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="occupation">Occupation</Label>
              <Input
                id="occupation"
                value={formData.occupation}
                onChange={(e) => updateFormData('occupation', e.target.value)}
                placeholder="Enter your occupation"
                className="mt-1"
              />
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="bio">Bio (Optional)</Label>
              <textarea
                id="bio"
                value={formData.bio}
                onChange={(e) => updateFormData('bio', e.target.value)}
                placeholder="Tell us a bit about yourself..."
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={4}
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getStepIcon = (step: number) => {
    switch (step) {
      case 1: return <User className="h-5 w-5" />;
      case 2: return <MapPin className="h-5 w-5" />;
      case 3: return <CheckCircle className="h-5 w-5" />;
      default: return <User className="h-5 w-5" />;
    }
  };

  const getStepTitle = (step: number) => {
    switch (step) {
      case 1: return 'Basic Information';
      case 2: return 'Location & Work';
      case 3: return 'Complete Profile';
      default: return 'Step';
    }
  };

  const getStepDescription = (step: number) => {
    switch (step) {
      case 1: return 'Tell us your name and contact information';
      case 2: return 'Help us understand your background';
      case 3: return 'Add a personal touch to your profile';
      default: return '';
    }
  };

  return (
    <Card className={`w-full max-w-2xl mx-auto ${className}`}>
      <CardHeader>
        <CardTitle className="text-center">Complete Your Profile</CardTitle>
        <CardDescription className="text-center">
          Let's set up your LenTrust profile to get started
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">Step {currentStep} of {totalSteps}</span>
            <span className="text-sm text-muted-foreground">
              {Math.round((currentStep / totalSteps) * 100)}%
            </span>
          </div>
          <Progress value={(currentStep / totalSteps) * 100} className="h-2" />
        </div>

        {/* Step Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
            {getStepIcon(currentStep)}
          </div>
          <div>
            <h3 className="font-semibold">{getStepTitle(currentStep)}</h3>
            <p className="text-sm text-muted-foreground">{getStepDescription(currentStep)}</p>
          </div>
        </div>

        {/* Step Content */}
        {renderStep()}

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            Previous
          </Button>
          
          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Next
            </Button>
          ) : (
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creating Profile...' : 'Complete Profile'}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}