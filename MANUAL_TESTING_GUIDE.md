# 🧪 Manual Testing Guide - Phase 4

## 📋 **Testing Overview**
This guide provides step-by-step instructions for manually testing the LenTrust application to ensure all functionality works correctly.

---

## 🚀 **Pre-Testing Setup**

### **1. Start the Application**
```bash
npm run dev:production
```
- **Expected**: App should start on http://localhost:8080
- **Check**: No console errors, smooth loading

### **2. Verify Environment**
- **Database**: Connected to Supabase project `leuqcbemxfdeuyjzfvcr`
- **Authentication**: Email confirmation disabled
- **Mode**: Production mode (default)

---

## 🎯 **Test 1: Production Mode Functionality**

### **1.1 Admin User Access**
1. **Navigate to**: http://localhost:8080
2. **Click**: "Sign In" tab
3. **Enter Admin Credentials**:
   - Email: `info.vishag@gmail.com`
   - Password: `7736882315`
4. **Click**: "Sign In"
5. **Expected Results**:
   - ✅ Successful login
   - ✅ Redirected to admin dashboard
   - ✅ Admin-specific features visible
   - ✅ Mode toggle visible (Demo/Production)

### **1.2 Regular User Access**
1. **Click**: "Register" tab
2. **Fill Registration Form**:
   - Name: `Test User`
   - Phone: `9876543210` (should auto-prefix with +91)
   - Email: `testuser@example.com`
   - Password: `TestPassword123!`
   - Confirm Password: `TestPassword123!`
3. **Click**: "Create Account"
4. **Expected Results**:
   - ✅ Successful registration
   - ✅ Auto-login after registration
   - ✅ Redirected to user dashboard
   - ✅ No admin features visible

---

## 🔐 **Test 2: Security Features**

### **2.1 Authentication Security**
1. **Test Invalid Login**:
   - Email: `invalid@example.com`
   - Password: `wrongpassword`
   - **Expected**: Error message, no login

2. **Test Weak Password**:
   - Try registering with password `123`
   - **Expected**: Validation error

3. **Test Invalid Email**:
   - Try registering with email `notanemail`
   - **Expected**: Validation error

### **2.2 Authorization Security**
1. **Login as Regular User**
2. **Try to Access Admin Features**:
   - Check if admin toggle is visible (should not be)
   - Check if admin controls are accessible (should not be)
3. **Expected**: No admin features visible to regular users

---

## 🔄 **Test 3: Authentication Flow**

### **3.1 Registration Flow**
1. **Click**: "Register" tab
2. **Test Valid Registration**:
   - Name: `John Doe`
   - Phone: `9876543210`
   - Email: `john@example.com`
   - Password: `Password123!`
   - Confirm Password: `Password123!`
3. **Click**: "Create Account"
4. **Expected Results**:
   - ✅ Success message
   - ✅ Auto-login
   - ✅ Redirect to dashboard

### **3.2 Login Flow**
1. **Click**: "Sign In" tab
2. **Test Valid Login**:
   - Email: `john@example.com`
   - Password: `Password123!`
3. **Click**: "Sign In"
4. **Expected Results**:
   - ✅ Success message
   - ✅ Redirect to dashboard

### **3.3 Logout Flow**
1. **Click**: Profile/Settings menu
2. **Click**: "Logout"
3. **Expected Results**:
   - ✅ Success message
   - ✅ Redirect to login page
   - ✅ Session cleared

---

## 👥 **Test 4: User Scenarios**

### **4.1 Admin User Scenarios**
1. **Login as Admin** (`info.vishag@gmail.com`)
2. **Test Admin Dashboard**:
   - ✅ Admin-specific features visible
   - ✅ Mode toggle present
   - ✅ User management capabilities

3. **Test Demo Mode Toggle**:
   - Click "Demo Mode" toggle
   - ✅ Switch to demo mode
   - ✅ Demo user selection panel visible
   - ✅ Test switching between demo users

4. **Test "Back to Admin Dashboard" Button**:
   - Switch to demo user (Borrower A, B, or Lender L1)
   - ✅ "Back to Admin Dashboard" button visible
   - ✅ Click button returns to admin dashboard

### **4.2 Regular User Scenarios**
1. **Login as Regular User**
2. **Test User Dashboard**:
   - ✅ Regular user features visible
   - ✅ No admin features
   - ✅ Profile management accessible

3. **Test Profile Management**:
   - Navigate to Profile page
   - ✅ View user information
   - ✅ Edit profile (if implemented)

---

## 📱 **Test 5: Phone Number Prefix**

### **5.1 Phone Number Input**
1. **Go to Registration Form**
2. **Test Phone Number Field**:
   - ✅ Default shows `+91` prefix
   - ✅ Type `9876543210`
   - ✅ Only numbers accepted
   - ✅ Final value: `+919876543210`

3. **Test Helper Text**:
   - ✅ "Enter your 10-digit mobile number" visible

---

## 🎨 **Test 6: UI/UX Testing**

### **6.1 Responsive Design**
1. **Test Mobile View**:
   - Resize browser to mobile size
   - ✅ Layout adapts properly
   - ✅ Touch interactions work

2. **Test Desktop View**:
   - Full desktop resolution
   - ✅ Layout looks good
   - ✅ All features accessible

### **6.2 Navigation**
1. **Test Page Navigation**:
   - Dashboard → Profile → Settings → Dashboard
   - ✅ Smooth transitions
   - ✅ No broken links

2. **Test Back Button**:
   - Use browser back button
   - ✅ Proper navigation history

---

## 🐛 **Test 7: Error Handling**

### **7.1 Network Errors**
1. **Disconnect Internet**:
   - Try to login/register
   - ✅ Appropriate error message
   - ✅ Graceful degradation

2. **Reconnect Internet**:
   - ✅ App recovers properly
   - ✅ Functionality restored

### **7.2 Input Validation**
1. **Test Empty Fields**:
   - Submit form with empty fields
   - ✅ Validation errors shown
   - ✅ Form doesn't submit

2. **Test Invalid Formats**:
   - Invalid email formats
   - Invalid phone numbers
   - ✅ Appropriate error messages

---

## 🚀 **Test 8: Performance Testing**

### **8.1 Page Load Times**
1. **Test Initial Load**:
   - ✅ Page loads within 3 seconds
   - ✅ No long loading spinners

2. **Test Navigation Speed**:
   - Click between pages
   - ✅ Fast transitions
   - ✅ No delays

### **8.2 Data Loading**
1. **Test Dashboard Data**:
   - ✅ Data loads quickly
   - ✅ No flickering
   - ✅ Smooth animations

---

## ✅ **Test 9: Final Validation**

### **9.1 Complete User Journey**
1. **New User Journey**:
   - Register → Login → Dashboard → Profile → Logout
   - ✅ All steps work smoothly

2. **Admin Journey**:
   - Admin Login → Dashboard → Demo Mode → User Switching → Back to Admin
   - ✅ All admin features work

3. **Returning User Journey**:
   - Login → Dashboard → Use App → Logout
   - ✅ Seamless experience

---

## 📊 **Test Results Checklist**

### **✅ Passed Tests**
- [ ] Admin login works
- [ ] Regular user registration works
- [ ] Phone number prefix works
- [ ] Demo mode switching works
- [ ] Security features work
- [ ] Logout works
- [ ] UI is responsive
- [ ] Error handling works
- [ ] Performance is good

### **❌ Failed Tests**
- [ ] Test 1: Description
- [ ] Test 2: Description

### **🔧 Issues Found**
- [ ] Issue 1: Description
- [ ] Issue 2: Description

---

## 📝 **Testing Notes**

### **Test Environment**
- **Date**: _Date_
- **Browser**: _Browser Version_
- **Device**: _Device Type_
- **Network**: _Network Type_

### **Test Results**
- **Total Tests**: _Number_
- **Passed**: _Number_
- **Failed**: _Number_
- **Success Rate**: _Percentage_

---

## 🎯 **Next Steps After Testing**

1. **If All Tests Pass**: ✅ Ready for production deployment
2. **If Some Tests Fail**: 🔧 Fix issues and re-test
3. **If Critical Issues**: 🚨 Address before deployment

---

## 📞 **Support**

If you encounter any issues during testing:
1. Check browser console for errors
2. Verify network connection
3. Ensure Supabase project is accessible
4. Contact development team if needed

---

**🎉 Happy Testing!**
