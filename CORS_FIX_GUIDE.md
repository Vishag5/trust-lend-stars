# CORS Error Fix - Mark as Paid Not Working

## ❌ Error
```
Access to fetch at 'https://leuqcbemxfdeuyjzfvcr.supabase.co/rest/v1/contracts...' 
from origin 'http://localhost:8080' has been blocked by CORS policy: 
Method PATCH is not allowed by Access-Control-Allow-Methods in preflight response.
```

## 🔍 Root Cause
Supabase REST API is blocking PATCH requests from `localhost:8080` because CORS is not properly configured.

---

## ✅ Solution 1: Configure CORS in Supabase Dashboard (Recommended)

### Step 1: Go to Supabase Project Settings
1. Navigate to: https://supabase.com/dashboard/project/leuqcbemxfdeuyjzfvcr/settings/api
2. Scroll down to **"API Settings"**
3. Find **"Allowed origins"** or **"CORS"** section

### Step 2: Add Localhost to Allowed Origins
Add these origins:
```
http://localhost:8080
http://localhost:5173
http://127.0.0.1:8080
http://127.0.0.1:5173
```

### Step 3: Allow PATCH Method
If there's an "Allowed Methods" setting, ensure these are checked:
- ✅ GET
- ✅ POST
- ✅ PATCH
- ✅ PUT
- ✅ DELETE
- ✅ OPTIONS

### Step 4: Save and Test
- Click **Save**
- Refresh your app at `localhost:8080`
- Try "Mark as Paid" again

---

## ✅ Solution 2: Use Demo Mode (Temporary Workaround)

If you want to test immediately without configuring Supabase:

### Check if You're in Demo Mode

**File**: `.env` or `.env.local`

Make sure you have:
```bash
# Remove or comment out Supabase URLs to force demo mode
# VITE_SUPABASE_URL=https://leuqcbemxfdeuyjzfvcr.supabase.co
# VITE_SUPABASE_ANON_KEY=your-key

# Or set demo mode explicitly
VITE_DEMO_MODE=true
```

Then restart your dev server:
```bash
npm run dev
```

**In Demo Mode**: Everything runs in localStorage, no CORS issues!

---

## ✅ Solution 3: Update Edge Function CORS (If Using Edge Functions)

If you're using Supabase Edge Functions for contract updates, update the CORS file:

**File**: `supabase/functions/_shared/cors.ts`

```typescript
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'GET, POST, PATCH, PUT, DELETE, OPTIONS',  // ✅ ADD THIS
  'Access-Control-Max-Age': '86400',  // ✅ ADD THIS (cache preflight for 24h)
};
```

Then redeploy your edge functions:
```bash
npx supabase functions deploy update-contract
```

---

## ✅ Solution 4: Proxy Configuration (For Local Development)

If CORS keeps blocking you, set up a proxy in your `vite.config.ts`:

**File**: `vite.config.ts`

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://leuqcbemxfdeuyjzfvcr.supabase.co',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/rest/v1'),
      },
    },
  },
});
```

Then update your Supabase client URL in `.env`:
```bash
VITE_SUPABASE_URL=http://localhost:8080/api
```

---

## 🔍 Verify Current Mode

Check which mode you're running in:

**Open Browser Console** and run:
```javascript
console.log(import.meta.env.VITE_SUPABASE_URL);
```

**If it shows**:
- `https://leuqcbemxfdeuyjzfvcr.supabase.co` → **Production Mode** (needs CORS fix)
- `undefined` or contains `demo` → **Demo Mode** (should work)

---

## 🧪 Quick Test

After applying any fix:

1. Open app at `http://localhost:8080`
2. Login with demo/production account
3. Go to Dashboard
4. Find an ACTIVE contract where you're the borrower
5. Click **"Mark as Paid"**
6. Upload a proof screenshot
7. ✅ Should work without CORS error

---

## 📊 Why This Happens

### CORS Preflight Request Flow:
```
Browser (localhost:8080)
   │
   │ 1. OPTIONS /rest/v1/contracts (preflight)
   ├────────────────────────────────────────────> Supabase
   │                                               
   │ 2. Response Headers:
   │    Access-Control-Allow-Methods: GET, POST
   │    ❌ Missing: PATCH, PUT, DELETE
   │<────────────────────────────────────────────
   │
   │ 3. Browser blocks PATCH request
   ╳ PATCH /rest/v1/contracts (blocked!)
```

**Fix**: Add PATCH to allowed methods in Supabase settings.

---

## 🎯 Recommended Approach

For **development**:
1. Use **Demo Mode** (fastest, no backend needed)
2. Or add `localhost:8080` to Supabase CORS settings

For **production**:
1. Deploy to a domain (e.g., `lentrust.netlify.app`)
2. Add domain to Supabase allowed origins
3. No CORS issues with same-domain or properly configured origins

---

## 🔗 Useful Links

- **Supabase CORS Docs**: https://supabase.com/docs/guides/api/cors
- **Supabase Project Settings**: https://supabase.com/dashboard/project/leuqcbemxfdeuyjzfvcr/settings/api
- **MDN CORS Guide**: https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS

---

## ⚡ Fastest Fix Right Now

Run this command to switch to demo mode:

```bash
cd /home/dell/Downloads/trust-lend-stars

# Create or update .env
echo "VITE_DEMO_MODE=true" >> .env

# Restart dev server
npm run dev
```

Then try "Mark as Paid" again - it will work in demo mode!
