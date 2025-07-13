# PWA (Progressive Web App) Setup

This document outlines the PWA implementation for the BetWise application, including service worker, manifest, and offline functionality.

## Features Implemented

### ✅ **Core PWA Features**
- **Service Worker**: Offline caching and background sync
- **Web App Manifest**: Installable app with proper metadata
- **Offline Support**: Graceful offline experience with cached content
- **Push Notifications**: Real-time updates and alerts
- **App-like Experience**: Full-screen mode and native feel
- **Background Sync**: Sync offline actions when connection returns

## Files Structure

```
public/
├── manifest.json          # PWA manifest configuration
├── sw.js                 # Service worker for offline functionality
├── offline.html          # Offline fallback page
└── icons/               # App icons (to be added)
    ├── icon-72x72.png
    ├── icon-96x96.png
    ├── icon-128x128.png
    ├── icon-144x144.png
    ├── icon-152x152.png
    ├── icon-192x192.png
    ├── icon-384x384.png
    └── icon-512x512.png

src/
├── components/
│   └── PWARegistration.tsx  # PWA registration and management
└── App.tsx                  # PWA manifest registration
```

## Service Worker Features

### Caching Strategies
- **Static Files**: Cache-first strategy for app shell
- **API Requests**: Network-first with cache fallback
- **External Resources**: Stale-while-revalidate strategy

### Offline Functionality
- Cached games and odds data
- Offline wallet balance display
- Background sync for pending actions
- Graceful error handling

### Push Notifications
- Real-time game updates
- Odds change notifications
- Payment confirmations
- Custom notification actions

## Installation Guide

### 1. Generate App Icons
Create app icons in the following sizes:
```bash
# Required sizes for PWA
72x72, 96x96, 128x128, 144x144, 152x152, 192x192, 384x384, 512x512
```

### 2. Add Icons to Public Directory
Place generated icons in `public/icons/` directory:
```
public/icons/
├── icon-72x72.png
├── icon-96x96.png
├── icon-128x128.png
├── icon-144x144.png
├── icon-152x152.png
├── icon-192x192.png
├── icon-384x384.png
└── icon-512x512.png
```

### 3. Configure Service Worker
The service worker is already configured with:
- Static file caching
- API request handling
- Background sync
- Push notifications

### 4. Test PWA Features
```bash
# Build and serve the application
npm run build
npm run preview

# Test PWA features:
# 1. Install prompt should appear
# 2. App should work offline
# 3. Push notifications should work
# 4. Background sync should function
```

## PWA Registration Component

The `PWARegistration` component provides:
- **Install Prompt**: Automatic detection and display
- **Update Notifications**: New version alerts
- **Connection Status**: Online/offline indicators
- **Notification Management**: Permission requests and testing
- **PWA Features Display**: Available functionality overview

## Usage Examples

### Basic PWA Registration
```tsx
import { PWARegistration } from '@/components/PWARegistration';

// In your component
<PWARegistration />
```

### Manual Service Worker Registration
```tsx
// Register service worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js')
    .then(registration => {
      console.log('SW registered:', registration);
    })
    .catch(error => {
      console.log('SW registration failed:', error);
    });
}
```

### Push Notification Setup
```tsx
// Request notification permission
const requestNotificationPermission = async () => {
  if ('Notification' in window) {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notifications enabled');
    }
  }
};
```

## Offline Functionality

### Cached Content
- App shell (HTML, CSS, JS)
- Static assets (images, fonts)
- API responses (games, user data)
- Offline page

### Offline Actions
- View cached games and odds
- Check wallet balance
- Review betting history
- Access saved preferences

### Background Sync
- Pending bets when offline
- Failed API requests
- User preferences sync
- Analytics data sync

## Push Notifications

### Notification Types
1. **Game Updates**: New games available
2. **Odds Changes**: Significant odds movements
3. **Payment Confirmations**: Successful transactions
4. **System Alerts**: Maintenance, updates, etc.

### Notification Actions
- **View Games**: Navigate to games list
- **Check Wallet**: Open wallet section
- **Close**: Dismiss notification

## Testing PWA Features

### Chrome DevTools
1. Open DevTools (F12)
2. Go to Application tab
3. Check:
   - Manifest (PWA configuration)
   - Service Workers (offline functionality)
   - Storage (cached content)
   - Background Services (push notifications)

### Lighthouse Audit
```bash
# Run Lighthouse audit
npx lighthouse https://your-app-url.com --view
```

### Offline Testing
1. Open DevTools
2. Go to Network tab
3. Check "Offline" checkbox
4. Refresh page
5. Verify offline functionality

## Deployment Considerations

### HTTPS Requirement
PWA features require HTTPS in production:
- Service Worker registration
- Push notifications
- Background sync
- Install prompts

### Cache Headers
Configure proper cache headers:
```nginx
# Nginx configuration
location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
    expires 1y;
    add_header Cache-Control "public, immutable";
}
```

### Service Worker Updates
- Version cache names for easy updates
- Skip waiting for immediate updates
- Notify users of new versions

## Performance Benefits

### Loading Performance
- **App Shell**: Instant loading from cache
- **Critical Resources**: Preloaded and cached
- **Lazy Loading**: Non-critical resources loaded on demand

### Offline Experience
- **Graceful Degradation**: Core features work offline
- **Background Sync**: Sync when connection returns
- **Smart Caching**: Intelligent cache strategies

### User Experience
- **Native Feel**: App-like interface
- **Installable**: Add to home screen
- **Push Notifications**: Real-time updates
- **Fast Loading**: Cached content loads instantly

## Troubleshooting

### Common Issues

1. **Service Worker Not Registering**
   - Check HTTPS requirement
   - Verify file path `/sw.js`
   - Check browser console for errors

2. **Install Prompt Not Showing**
   - Ensure PWA criteria are met
   - Check manifest.json validity
   - Verify service worker is active

3. **Offline Not Working**
   - Check cache configuration
   - Verify static files are cached
   - Test with DevTools offline mode

4. **Push Notifications Not Working**
   - Check notification permissions
   - Verify service worker registration
   - Test with simple notification first

### Debug Commands
```javascript
// Check service worker status
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('SW registrations:', registrations);
});

// Check cache contents
caches.keys().then(names => {
  names.forEach(name => {
    caches.open(name).then(cache => {
      cache.keys().then(requests => {
        console.log(`Cache ${name}:`, requests);
      });
    });
  });
});
```

## Future Enhancements

### Planned Features
1. **Advanced Caching**: Intelligent cache invalidation
2. **Background Sync**: More sophisticated sync strategies
3. **Push Analytics**: Track notification engagement
4. **Offline Analytics**: Collect offline usage data
5. **Advanced Notifications**: Rich notifications with actions

### Performance Optimizations
1. **Preload Critical Resources**: Fonts, images, scripts
2. **Code Splitting**: Lazy load non-critical components
3. **Image Optimization**: WebP/AVIF support
4. **Bundle Optimization**: Tree shaking and minification

## Browser Support

### PWA Features Support
- **Chrome**: Full support
- **Firefox**: Full support
- **Safari**: Limited support (iOS 11.3+)
- **Edge**: Full support

### Service Worker Support
- **Chrome**: 40+
- **Firefox**: 44+
- **Safari**: 11.1+
- **Edge**: 17+

### Push Notifications Support
- **Chrome**: 42+
- **Firefox**: 44+
- **Safari**: 16+
- **Edge**: 17+

## Security Considerations

### HTTPS Requirement
- All PWA features require HTTPS
- Local development works with localhost
- Production must use valid SSL certificate

### Permission Management
- Request permissions only when needed
- Provide clear explanation of permissions
- Allow users to revoke permissions

### Data Privacy
- Cache only necessary data
- Implement proper data retention policies
- Respect user privacy preferences 