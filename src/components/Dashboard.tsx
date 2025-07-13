import React, { useState } from 'react';
import { useAuth } from './AuthGuard';
import { Header } from './layout/Header';
import { WalletSection } from './wallet/WalletSection';
import { DailySubscriptionModal } from './subscription/DailySubscriptionModal';
import { GamesList } from './games/GamesList';
import { AdminDashboard } from './admin/AdminDashboard';
import { Lock, Star, Zap, CheckCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const Dashboard: React.FC = () => {
  const { user, hasDailyAccess } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(!hasDailyAccess());

  if (user?.isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <WalletSection />
        
        {hasDailyAccess() ? (
          <GamesList />
        ) : (
          <div className="max-w-4xl mx-auto">
            <Card className="shadow-betting overflow-hidden">
              <CardHeader className="text-center pb-6">
                <div className="flex justify-center mb-4">
                  <div className="w-16 h-16 bg-gradient-primary rounded-full flex items-center justify-center">
                    <Lock className="h-8 w-8 text-white" />
                  </div>
                </div>
                <CardTitle className="text-3xl font-bold text-foreground mb-2">
                  Unlock Today's Premium Odds
                </CardTitle>
                <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                  Get access to our expert analysis and verified sure odds for today's football matches
                </p>
              </CardHeader>
              
              <CardContent className="space-y-8">
                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-primary/5 rounded-lg border border-primary/10">
                    <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Star className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Verified Sure Odds</h3>
                    <p className="text-sm text-muted-foreground">
                      Expert-analyzed odds with high confidence ratings
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-success/5 rounded-lg border border-success/10">
                    <div className="w-12 h-12 bg-gradient-success rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Zap className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Real-time Updates</h3>
                    <p className="text-sm text-muted-foreground">
                      Live odds updates and match analysis
                    </p>
                  </div>
                  
                  <div className="text-center p-6 bg-warning/5 rounded-lg border border-warning/10">
                    <div className="w-12 h-12 bg-gradient-warning rounded-lg flex items-center justify-center mx-auto mb-4">
                      <CheckCircle className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-foreground mb-2">Expert Analysis</h3>
                    <p className="text-sm text-muted-foreground">
                      Professional insights and betting strategies
                    </p>
                  </div>
                </div>

                {/* Pricing Section */}
                <div className="text-center p-8 bg-gradient-primary rounded-2xl text-white">
                  <div className="mb-4">
                    <div className="text-4xl font-bold mb-2">KES 500</div>
                    <div className="text-lg opacity-90">One Day Access</div>
                  </div>
                  <div className="space-y-2 text-sm opacity-90">
                    <div>✓ Access to all premium odds</div>
                    <div>✓ Expert analysis and tips</div>
                    <div>✓ Real-time updates</div>
                    <div>✓ 24-hour support</div>
                  </div>
                </div>

                {/* CTA Button */}
                <div className="text-center">
                  <Button
                    onClick={() => setShowSubscriptionModal(true)}
                    variant="gradient"
                    size="lg"
                    className="px-12 py-4 text-lg font-semibold animate-pulse-glow"
                  >
                    <Star className="h-5 w-5 mr-2" />
                    Unlock Premium Access - KES 500
                  </Button>
                  <p className="text-sm text-muted-foreground mt-3">
                    Access expires at midnight. New payment required daily.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </main>

      {showSubscriptionModal && (
        <DailySubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
    </div>
  );
};