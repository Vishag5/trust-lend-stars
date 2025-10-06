// Security Test Runner - Automated Testing
import { validateFile } from './fileValidation';
import { validateAndSanitize, phoneSchema, amountSchema } from './inputValidation';
import { rateLimit } from './rateLimiter';
import { validateEnvironment } from './envSecurity';

export interface SecurityTestResult {
  testName: string;
  passed: boolean;
  message: string;
  details?: any;
}

export class SecurityTestRunner {
  private results: SecurityTestResult[] = [];

  async runAllTests(): Promise<SecurityTestResult[]> {
    console.log('🔒 Starting Security Tests...');
    this.results = [];

    // Test 1: File Upload Security
    await this.testFileUploadSecurity();
    
    // Test 2: Input Validation Security
    await this.testInputValidationSecurity();
    
    // Test 3: Rate Limiting Security
    await this.testRateLimitingSecurity();
    
    // Test 4: Environment Security
    await this.testEnvironmentSecurity();
    
    // Test 5: XSS Protection
    await this.testXSSProtection();

    console.log('✅ Security Tests Complete!');
    return this.results;
  }

  private async testFileUploadSecurity() {
    console.log('📁 Testing File Upload Security...');
    
    // Test valid image file
    const validImageFile = new File(['fake-image-data'], 'test.jpg', { type: 'image/jpeg' });
    const validResult = validateFile(validImageFile);
    this.addResult('File Upload - Valid Image', validResult.valid, 
      validResult.valid ? 'Valid image accepted' : validResult.error || 'Failed');

    // Test invalid file type
    const invalidFile = new File(['fake-data'], 'test.exe', { type: 'application/x-msdownload' });
    const invalidResult = validateFile(invalidFile);
    this.addResult('File Upload - Invalid Type', !invalidResult.valid, 
      !invalidResult.valid ? 'Invalid file type blocked' : 'Security issue: Invalid file accepted');

    // Test oversized file (simulate)
    const oversizedFile = new File(['x'.repeat(6 * 1024 * 1024)], 'large.jpg', { type: 'image/jpeg' });
    const oversizedResult = validateFile(oversizedFile);
    this.addResult('File Upload - Size Limit', !oversizedResult.valid, 
      !oversizedResult.valid ? 'Oversized file blocked' : 'Security issue: Oversized file accepted');
  }

  private async testInputValidationSecurity() {
    console.log('📝 Testing Input Validation Security...');
    
    // Test valid phone number
    const validPhone = validateAndSanitize(phoneSchema, '+91 9876543210');
    this.addResult('Input Validation - Valid Phone', validPhone.success, 
      validPhone.success ? 'Valid phone accepted' : validPhone.error || 'Failed');

    // Test invalid phone number
    const invalidPhone = validateAndSanitize(phoneSchema, '123');
    this.addResult('Input Validation - Invalid Phone', !invalidPhone.success, 
      !invalidPhone.success ? 'Invalid phone blocked' : 'Security issue: Invalid phone accepted');

    // Test valid amount
    const validAmount = validateAndSanitize(amountSchema, 1000);
    this.addResult('Input Validation - Valid Amount', validAmount.success, 
      validAmount.success ? 'Valid amount accepted' : validAmount.error || 'Failed');

    // Test invalid amount (too small)
    const invalidAmount = validateAndSanitize(amountSchema, 50);
    this.addResult('Input Validation - Invalid Amount', !invalidAmount.success, 
      !invalidAmount.success ? 'Invalid amount blocked' : 'Security issue: Invalid amount accepted');
  }

  private async testRateLimitingSecurity() {
    console.log('⏱️ Testing Rate Limiting Security...');
    
    const testKey = 'test-user-123';
    const config = { limit: 3, windowMs: 60000 }; // 3 requests per minute
    
    // Test normal requests
    const request1 = rateLimit(testKey, config);
    const request2 = rateLimit(testKey, config);
    const request3 = rateLimit(testKey, config);
    const request4 = rateLimit(testKey, config); // Should be blocked
    
    this.addResult('Rate Limiting - Normal Requests', request1 && request2 && request3, 
      'First 3 requests allowed');
    
    this.addResult('Rate Limiting - Blocked Request', !request4, 
      request4 ? 'Security issue: Rate limit not working' : 'Rate limit working correctly');
  }

  private async testEnvironmentSecurity() {
    console.log('🔧 Testing Environment Security...');
    
    try {
      validateEnvironment();
      this.addResult('Environment Security - Validation', true, 
        'Environment validation passed');
    } catch (error) {
      this.addResult('Environment Security - Validation', false, 
        `Environment validation failed: ${error}`);
    }
  }

  private async testXSSProtection() {
    console.log('🛡️ Testing XSS Protection...');
    
    const maliciousInput = '<script>alert("XSS")</script>';
    const sanitizedInput = validateAndSanitize(phoneSchema, maliciousInput);
    
    this.addResult('XSS Protection - Script Tag', !sanitizedInput.success, 
      sanitizedInput.success ? 'Security issue: XSS not blocked' : 'XSS attack blocked');
  }

  private addResult(testName: string, passed: boolean, message: string, details?: any) {
    this.results.push({
      testName,
      passed,
      message,
      details
    });
    
    const status = passed ? '✅' : '❌';
    console.log(`${status} ${testName}: ${message}`);
  }

  getTestSummary(): { total: number; passed: number; failed: number; percentage: number } {
    const total = this.results.length;
    const passed = this.results.filter(r => r.passed).length;
    const failed = total - passed;
    const percentage = total > 0 ? Math.round((passed / total) * 100) : 0;
    
    return { total, passed, failed, percentage };
  }
}

// Export for use in components
export const runSecurityTests = async (): Promise<SecurityTestResult[]> => {
  const runner = new SecurityTestRunner();
  return await runner.runAllTests();
};
