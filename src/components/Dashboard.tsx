import React, { useState } from 'react';
import { useAuth } from './AuthGuard';
import { Header } from './layout/Header';
import { WalletSection } from './wallet/WalletSection';
import { DailySubscriptionModal } from './subscription/DailySubscriptionModal';
import { GamesList } from './games/GamesList';
import { AdminDashboard } from './admin/AdminDashboard';
import { DebugInfo } from './DebugInfo';

export const Dashboard: React.FC = () => {
  const { user, hasDailyAccess } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(!hasDailyAccess());

  if (user?.isAdmin) {
    return <AdminDashboard />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Header />
      
      <main className="container mx-auto px-4 py-6 space-y-6">
        <WalletSection />
        
        {hasDailyAccess() ? (
          <GamesList />
        ) : (
          <div className="text-center py-12">
            <div className="max-w-md mx-auto bg-card p-8 rounded-lg shadow-card">
              <h2 className="text-2xl font-bold mb-4">Access Today's Sure Odds</h2>
              <p className="text-muted-foreground mb-6">
                Pay KES 500 to unlock today's premium betting tips and odds
              </p>
              <button
                onClick={() => setShowSubscriptionModal(true)}
                className="bg-gradient-primary text-primary-foreground px-8 py-3 rounded-lg font-semibold hover:shadow-glow transition-all duration-200 transform hover:scale-105"
              >
                Unlock Today's Odds - KES 500
              </button>
            </div>
          </div>
        )}
      </main>

      {showSubscriptionModal && (
        <DailySubscriptionModal onClose={() => setShowSubscriptionModal(false)} />
      )}
      
      {/* <DebugInfo /> */}
    </div>
  );
};