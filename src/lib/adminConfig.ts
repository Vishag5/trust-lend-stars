// Admin Configuration
export const ADMIN_CONFIG = {
  // Admin email addresses
  adminEmails: [
    'info.vishag@gmail.com',
    'admin@lentrust.com'
  ],
  
  // Admin phone numbers (if needed)
  adminPhones: [
    '+917012938275'
  ],
  
  // Check if user is admin
  isAdmin: (email: string, phone?: string) => {
    return ADMIN_CONFIG.adminEmails.includes(email.toLowerCase()) ||
           (phone && ADMIN_CONFIG.adminPhones.includes(phone));
  },
  
  // Get admin type
  getAdminType: (email: string, phone?: string) => {
    if (ADMIN_CONFIG.adminEmails.includes(email.toLowerCase())) {
      return 'email';
    }
    if (phone && ADMIN_CONFIG.adminPhones.includes(phone)) {
      return 'phone';
    }
    return null;
  }
};

// Admin features
export const ADMIN_FEATURES = {
  // Toggle between demo and production mode
  modeToggle: true,
  
  // Access to debug panels
  debugPanels: true,
  
  // Access to test suites
  testSuites: true,
  
  // Access to user management
  userManagement: true,
  
  // Access to analytics
  analytics: true
};
