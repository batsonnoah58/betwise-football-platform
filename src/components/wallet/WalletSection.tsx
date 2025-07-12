import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DepositModal } from './DepositModal';
import { Wallet, Plus, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

export const WalletSection: React.FC = () => {
  const { user } = useAuth();
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [todayStats, setTodayStats] = useState({ wins: 0, losses: 0 });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  useEffect(() => {
    if (user) {
      fetchTodayStats();
    }
  }, [user]);

  const fetchTodayStats = async () => {
    if (!user) return;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    try {
      const { data: bets } = await supabase
        .from('bets')
        .select('status, stake, odds')
        .eq('user_id', user.id)
        .gte('placed_at', today.toISOString());

      if (bets) {
        const wins = bets.filter(bet => bet.status === 'won').reduce((sum, bet) => 
          sum + (Number(bet.stake) * Number(bet.odds) - Number(bet.stake)), 0);
        const losses = bets.filter(bet => bet.status === 'lost').reduce((sum, bet) => 
          sum + Number(bet.stake), 0);

        setTodayStats({ wins, losses });
      }
    } catch (error) {
      console.error('Error fetching today stats:', error);
    }
  };

  return (
    <>
      <Card className="shadow-betting animate-fade-in">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Wallet className="h-5 w-5 text-primary" />
            <span>Your Wallet</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-3xl font-bold text-primary mb-1">
                {formatCurrency(user?.walletBalance || 0)}
              </div>
              <div className="text-sm text-muted-foreground flex items-center space-x-1">
                <TrendingUp className="h-3 w-3 text-success" />
                <span>Available Balance</span>
              </div>
            </div>
            
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => setShowDepositModal(true)}
              className="animate-pulse-glow"
            >
              <Plus className="h-4 w-4 mr-2" />
              Deposit
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-6 pt-4 border-t border-border">
            <div className="text-center">
              <div className="text-lg font-semibold text-success">
                +{formatCurrency(todayStats.wins)}
              </div>
              <div className="text-xs text-muted-foreground">Today's Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-destructive">
                -{formatCurrency(todayStats.losses)}
              </div>
              <div className="text-xs text-muted-foreground">Today's Losses</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {showDepositModal && (
        <DepositModal onClose={() => setShowDepositModal(false)} />
      )}
    </>
  );
};