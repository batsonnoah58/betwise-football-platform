# Netlify Deployment Troubleshooting Guide

## Common Issues and Solutions

### 1. **Environment Variables Not Configured**

**Problem**: The app loads but shows a blank screen or infinite loading.

**Solution**: Add environment variables in Netlify dashboard:

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PESAPAL_CONSUMER_KEY=AavkSqNKh2cHSk2p4vH-3X0bPx3k_T3h6Fc9ANi2Ki-agOICTis75XogcqvgBMXhTlHwOTEt5gN7L03W
VITE_PESAPAL_CONSUMER_SECRET=EIpGzdrOjREpQM5fsNCEycT-OUlmTJB4_QbJXKVCbmGKi5pySO4vJJyW1rZD08Y30ZmXi3Vp2e6vzy5R
VITE_PESAPAL_BUSINESS_SHORTCODE=your_pesapal_business_shortcode
VITE_PESAPAL_PASSKEY=your_pesapal_passkey
VITE_PESAPAL_ENVIRONMENT=sandbox
VITE_MODE=production
```

### 2. **Build Failures**

**Problem**: Build fails during deployment.

**Solution**: Check build logs and ensure:

1. **Node Version**: Set to 18 in netlify.toml
2. **Build Command**: `npm run build`
3. **Publish Directory**: `dist`

### 3. **React Router Issues**

**Problem**: Direct URL access returns 404.

**Solution**: The netlify.toml file includes redirects for SPA routing:

```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### 4. **Console Errors**

**Problem**: JavaScript errors in browser console.

**Solutions**:

1. **Check Browser Console**: Open DevTools and look for errors
2. **Environment Variables**: Ensure all required variables are set
3. **Network Issues**: Check if Supabase/PesaPal APIs are accessible

### 5. **Performance Issues**

**Problem**: Large bundle size causing slow loading.

**Solution**: The build already includes optimizations, but you can:

1. **Enable Compression**: Netlify automatically compresses assets
2. **CDN**: Netlify uses global CDN for faster loading
3. **Caching**: Headers are configured for optimal caching

## Deployment Checklist

### ✅ Pre-Deployment
- [ ] All environment variables configured in Netlify
- [ ] Build passes locally (`npm run build`)
- [ ] No TypeScript errors (`npm run lint`)
- [ ] All dependencies installed

### ✅ Post-Deployment
- [ ] Site loads without errors
- [ ] Navigation works correctly
- [ ] Authentication flows work
- [ ] Payment integration functions
- [ ] Admin dashboard accessible

## Environment Variables Guide

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SUPABASE_URL` | Your Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous key | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` |
| `VITE_PESAPAL_CONSUMER_KEY` | PesaPal API consumer key | `AavkSqNKh2cHSk2p4vH-3X0bPx3k_T3h6Fc9ANi2Ki-agOICTis75XogcqvgBMXhTlHwOTEt5gN7L03W` |
| `VITE_PESAPAL_CONSUMER_SECRET` | PesaPal API secret | `EIpGzdrOjREpQM5fsNCEycT-OUlmTJB4_QbJXKVCbmGKi5pySO4vJJyW1rZD08Y30ZmXi3Vp2e6vzy5R` |
| `VITE_PESAPAL_ENVIRONMENT` | PesaPal environment | `sandbox` or `live` |
| `VITE_MODE` | Application mode | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `VITE_PESAPAL_BUSINESS_SHORTCODE` | PesaPal business shortcode | `your_shortcode` |
| `VITE_PESAPAL_PASSKEY` | PesaPal API passkey | `your_passkey` |

## Debugging Steps

### 1. **Check Build Logs**
- Go to Netlify dashboard > Deploys
- Click on the latest deploy
- Check build logs for errors

### 2. **Check Browser Console**
- Open your deployed site
- Press F12 to open DevTools
- Check Console tab for errors
- Check Network tab for failed requests

### 3. **Test Environment Variables**
Add this temporary code to check if variables are loaded:

```javascript
console.log('Environment check:', {
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL,
  pesapalKey: import.meta.env.VITE_PESAPAL_CONSUMER_KEY ? 'Set' : 'Not set'
});
```

### 4. **Test API Connections**
- Check if Supabase connection works
- Verify PesaPal API credentials
- Test authentication flow

## Common Error Messages

### "Module not found"
- Check if all dependencies are in package.json
- Ensure build process completes successfully

### "Environment variable not defined"
- Add missing variables to Netlify environment settings
- Redeploy after adding variables

### "Cannot read property of undefined"
- Check if environment variables are properly loaded
- Verify API endpoints are accessible

### "Network error"
- Check if Supabase/PesaPal services are available
- Verify CORS settings if applicable

## Performance Optimization

### 1. **Bundle Size**
- Current bundle: ~572KB (gzipped: ~167KB)
- Consider code splitting for larger apps

### 2. **Loading Time**
- Enable Netlify's automatic optimization
- Use CDN for static assets
- Implement lazy loading for routes

### 3. **Caching**
- Static assets are cached automatically
- API responses should include proper cache headers

## Support

If issues persist:

1. **Check Netlify Status**: https://status.netlify.com
2. **Review Build Logs**: Detailed error information
3. **Test Locally**: Ensure app works in development
4. **Contact Support**: Netlify support for deployment issues

## Quick Fixes

### Immediate Actions:
1. **Redeploy**: Trigger a new deployment
2. **Clear Cache**: Hard refresh browser (Ctrl+F5)
3. **Check Variables**: Verify all environment variables are set
4. **Test Locally**: Ensure app builds and runs locally

### If Still Not Working:
1. **Check Console**: Look for specific error messages
2. **Verify URLs**: Ensure all API endpoints are correct
3. **Test APIs**: Verify Supabase and PesaPal connections
4. **Rollback**: Deploy previous working version if needed 