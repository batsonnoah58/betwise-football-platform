import React, { useEffect, useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { Download, RefreshCw, Bell, Wifi, WifiOff } from 'lucide-react';
import { toast } from 'sonner';

interface PWAInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PWARegistration: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstalled, setIsInstalled] = useState(false);
  const [showInstallPrompt, setShowInstallPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<PWAInstallPromptEvent | null>(null);
  const [swRegistration, setSwRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [updateAvailable, setUpdateAvailable] = useState(false);

  useEffect(() => {
    registerServiceWorker();
    setupEventListeners();
    checkInstallationStatus();
  }, []);

  const registerServiceWorker = async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        setSwRegistration(registration);
        
        console.log('Service Worker registered successfully:', registration);

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true);
                toast.info('New version available! Click to update.');
              }
            });
          }
        });

        // Handle service worker updates
        navigator.serviceWorker.addEventListener('controllerchange', () => {
          toast.success('App updated successfully!');
          setUpdateAvailable(false);
        });

      } catch (error) {
        console.error('Service Worker registration failed:', error);
      }
    }
  };

  const setupEventListeners = () => {
    // Online/offline status
    const handleOnline = () => {
      setIsOnline(true);
      toast.success('You are back online!');
    };

    const handleOffline = () => {
      setIsOnline(false);
      toast.error('You are offline. Some features may be limited.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // PWA install prompt
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e as PWAInstallPromptEvent);
      setShowInstallPrompt(true);
    });

    // PWA installed
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setShowInstallPrompt(false);
      setDeferredPrompt(null);
      toast.success('BetWise installed successfully!');
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  };

  const checkInstallationStatus = () => {
    // Check if app is installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
    }
  };

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstallPrompt(false);
    }
  };

  const handleUpdateClick = () => {
    if (swRegistration && swRegistration.waiting) {
      swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
    }
  };

  const requestNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        toast.success('Notifications enabled!');
      } else {
        toast.error('Notification permission denied');
      }
    }
  };

  const sendTestNotification = () => {
    if ('serviceWorker' in navigator && 'Notification' in window) {
      navigator.serviceWorker.ready.then((registration) => {
        registration.showNotification('BetWise', {
          body: 'This is a test notification!',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/badge-72x72.png',
        });
      });
    }
  };

  return (
    <div className="space-y-4">
      {/* Connection Status */}
      <Card className="shadow-betting">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            {isOnline ? <Wifi className="h-5 w-5 text-green-500" /> : <WifiOff className="h-5 w-5 text-red-500" />}
            <span>Connection Status</span>
            <Badge variant={isOnline ? 'default' : 'destructive'}>
              {isOnline ? 'Online' : 'Offline'}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {isOnline 
              ? 'You are connected to the internet. All features are available.'
              : 'You are offline. Some features may be limited.'
            }
          </p>
        </CardContent>
      </Card>

      {/* PWA Installation */}
      {showInstallPrompt && !isInstalled && (
        <Card className="shadow-betting border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <Download className="h-5 w-5 text-primary" />
              <span>Install BetWise</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Install BetWise on your device for a better experience with offline access and notifications.
            </p>
            <Button onClick={handleInstallClick} className="w-full">
              <Download className="h-4 w-4 mr-2" />
              Install App
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Update Available */}
      {updateAvailable && (
        <Card className="shadow-betting border-warning/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center space-x-2 text-lg">
              <RefreshCw className="h-5 w-5 text-warning" />
              <span>Update Available</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              A new version of BetWise is available. Update to get the latest features and improvements.
            </p>
            <Button onClick={handleUpdateClick} variant="outline" className="w-full">
              <RefreshCw className="h-4 w-4 mr-2" />
              Update Now
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Notifications */}
      <Card className="shadow-betting">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Bell className="h-5 w-5 text-primary" />
            <span>Notifications</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Get notified about new games, odds updates, and important betting information.
          </p>
          <div className="flex space-x-2">
            <Button onClick={requestNotificationPermission} variant="outline" className="flex-1">
              Enable Notifications
            </Button>
            <Button onClick={sendTestNotification} variant="outline" className="flex-1">
              Test Notification
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* PWA Features */}
      <Card className="shadow-betting">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">PWA Features</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Offline Access</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Push Notifications</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>App-like Experience</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Background Sync</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Fast Loading</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span>Home Screen Icon</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}; 