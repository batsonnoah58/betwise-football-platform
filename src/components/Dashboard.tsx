import React, { useState, useMemo } from 'react';
import { useAuth } from './AuthGuard';
import { Header } from './layout/Header';
import { WalletSection } from './wallet/WalletSection';
import { DailySubscriptionModal } from './subscription/DailySubscriptionModal';
import { GamesList } from './games/GamesList';
import { AdminDashboard } from './admin/AdminDashboard';
import { Lock, Star, Zap, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const Dashboard: React.FC = React.memo(() => {
  const { user, hasDailyAccess } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Memoize expensive computations
  const shouldShowSubscription = useMemo(() => {
    return !hasDailyAccess();
  }, [hasDailyAccess]);

  // Initialize subscription modal state
  React.useEffect(() => {
    if (shouldShowSubscription) {
      setShowSubscriptionModal(true);
    }
  }, [shouldShowSubscription]);

  // Early return for admin users
  if (user?.isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        <WalletSection />
        
        {hasDailyAccess() ? (
          <GamesList />
        ) : (
          <SubscriptionPrompt onSubscribe={() => setShowSubscriptionModal(true)} />
        )}
      </main>

      {showSubscriptionModal && (
        <DailySubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
});

// Separate component for subscription prompt to avoid re-renders
const SubscriptionPrompt: React.FC<{ onSubscribe: () => void }> = React.memo(({ onSubscribe }) => (
  <div className="max-w-4xl mx-auto">
    <Card className="shadow-betting overflow-hidden">
      <CardHeader className="text-center pb-6 px-4 sm:px-6">
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-primary rounded-full flex items-center justify-center">
            <Lock className="h-8 w-8 sm:h-10 sm:w-10 text-white" />
          </div>
        </div>
        <CardTitle className="text-2xl sm:text-3xl lg:text-4xl font-bold text-foreground mb-2 sm:mb-3">
          Unlock Today's Premium Odds
        </CardTitle>
        <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-2">
          Get access to our expert analysis and verified sure odds for today's football matches
        </p>
      </CardHeader>
      
      <CardContent className="space-y-6 sm:space-y-8 px-4 sm:px-6">
        {/* Features Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          <div className="text-center p-4 sm:p-6 bg-primary/5 rounded-lg border border-primary/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Star className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Verified Sure Odds</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Expert-analyzed odds with high confidence ratings
            </p>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-success/5 rounded-lg border border-success/10">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-success rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Real-time Updates</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Live odds updates and match analysis
            </p>
          </div>
          
          <div className="text-center p-4 sm:p-6 bg-warning/5 rounded-lg border border-warning/10 sm:col-span-2 lg:col-span-1">
            <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-warning rounded-lg flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
            </div>
            <h3 className="font-semibold text-foreground mb-2 text-sm sm:text-base">Expert Analysis</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">
              Professional insights and betting strategies
            </p>
          </div>
        </div>

        {/* Pricing Section */}
        <div className="text-center p-6 sm:p-8 bg-gradient-primary rounded-2xl text-white">
          <div className="mb-4 sm:mb-6">
            <div className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-2">KES 500</div>
            <div className="text-base sm:text-lg opacity-90">One Day Access</div>
          </div>
          <div className="space-y-2 text-sm sm:text-base opacity-90">
            <div>✓ Access to all premium odds</div>
            <div>✓ Expert analysis and tips</div>
            <div>✓ Real-time updates</div>
            <div>✓ 24-hour support</div>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <Button
            onClick={onSubscribe}
            variant="gradient"
            size="lg"
            className="px-8 sm:px-12 py-3 sm:py-4 text-base sm:text-lg font-semibold animate-pulse-glow w-full sm:w-auto"
          >
            <Star className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
            Unlock Premium Access - KES 500
          </Button>
          <p className="text-xs sm:text-sm text-muted-foreground mt-3 px-2">
            Access expires at midnight. New payment required daily.
          </p>
        </div>
      </CardContent>
    </Card>
  </div>
));