import React, { useState, useEffect } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { DepositModal } from './DepositModal';
import { Wallet, Plus, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '../ui/badge';

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
        .eq('user_id', user?.id)
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
      <Card className="shadow-betting animate-fade-in overflow-hidden">
        <CardHeader className="pb-4 px-4 sm:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
              <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-primary rounded-lg flex items-center justify-center">
                <Wallet className="h-3 w-3 sm:h-4 sm:w-4 text-white" />
              </div>
              <span>Your Wallet</span>
            </CardTitle>
            <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20 text-xs sm:text-sm">
              Active
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          {/* Main Balance */}
          <div className="text-center space-y-2">
            <div className="text-3xl sm:text-4xl md:text-5xl font-bold text-primary mb-2">
              {formatCurrency(user?.walletBalance ?? 0)}
            </div>
            <div className="text-xs sm:text-sm text-muted-foreground flex items-center justify-center space-x-1">
              <TrendingUp className="h-3 w-3 text-success" />
              <span>Available Balance</span>
            </div>
          </div>

          {/* Action Button */}
          <div className="flex justify-center">
            <Button 
              variant="gradient" 
              size="lg"
              onClick={() => setShowDepositModal(true)}
              className="animate-pulse-glow px-6 sm:px-8 py-3 text-sm sm:text-base font-semibold w-full sm:w-auto focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <Plus className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
              Add Funds
            </Button>
          </div>

          {/* Today's Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 pt-4 border-t border-border/50">
            <div className="text-center p-3 sm:p-4 bg-success/5 rounded-lg border border-success/10">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <ArrowUpRight className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
                <span className="text-base sm:text-lg font-bold text-success">
                  +{formatCurrency(todayStats.wins)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Today's Wins</div>
            </div>
            <div className="text-center p-3 sm:p-4 bg-destructive/5 rounded-lg border border-destructive/10">
              <div className="flex items-center justify-center space-x-1 mb-2">
                <ArrowDownRight className="h-3 w-3 sm:h-4 sm:w-4 text-destructive" />
                <span className="text-base sm:text-lg font-bold text-destructive">
                  -{formatCurrency(todayStats.losses)}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">Today's Losses</div>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 pt-4 border-t border-border/50">
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-primary">
                {todayStats.wins + todayStats.losses}
              </div>
              <div className="text-xs text-muted-foreground">Today's Bets</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-success">
                {todayStats.wins > 0 ? '+' : ''}{formatCurrency(todayStats.wins)}
              </div>
              <div className="text-xs text-muted-foreground">Today's Wins</div>
            </div>
            <div className="text-center">
              <div className="text-lg sm:text-2xl font-bold text-destructive">
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