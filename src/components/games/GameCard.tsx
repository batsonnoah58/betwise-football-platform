import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Clock, Trophy, Users, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GameCardProps {
  game: {
    id: number;
    homeTeam: {
      id: number;
      name: string;
      logo: string;
    };
    awayTeam: {
      id: number;
      name: string;
      logo: string;
    };
    league: string;
    kickOffTime: string;
    odds: {
      home: number;
      draw: number;
      away: number;
    };
    status: string;
    confidence: string;
  };
}

export const GameCard: React.FC<GameCardProps> = ({ game }) => {
  const { user, updateWallet } = useAuth();
  const [stakes, setStakes] = useState({ home: '', draw: '', away: '' });
  const [bettingOn, setBettingOn] = useState<'home' | 'draw' | 'away' | null>(null);

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getConfidenceBadge = (confidence: string) => {
    const variants = {
      'very-high': { className: 'bg-gradient-success text-white', text: '🔥 VERY HIGH' },
      'high': { className: 'bg-success text-success-foreground', text: '⭐ HIGH' },
      'medium': { className: 'bg-warning text-warning-foreground', text: '📊 MEDIUM' }
    };
    return variants[confidence as keyof typeof variants] || variants.medium;
  };

  const handleBet = async (betType: 'home' | 'draw' | 'away') => {
    if (!user) return;
    
    const stake = parseFloat(stakes[betType]);
    
    if (isNaN(stake) || stake <= 0) {
      toast.error("Please enter a valid stake amount");
      return;
    }

    if (stake > user.walletBalance) {
      toast.error("Your stake exceeds your wallet balance");
      return;
    }

    if (stake < 10) {
      toast.error("Minimum stake amount is KES 10");
      return;
    }

    setBettingOn(betType);

    try {
      // Get odds for the selected outcome
      const odds = game.odds[betType];
      const potentialWinnings = stake * odds;

      // Place bet in database
      const { error } = await supabase
        .from('bets')
        .insert({
          user_id: user.id,
          game_id: game.id,
          stake,
          bet_on: betType === 'home' ? 'home_win' : betType === 'draw' ? 'draw' : 'away_win',
          odds,
          potential_winnings: potentialWinnings
        });

      if (error) {
        throw error;
      }

      // Update wallet balance (deduct stake)
      await updateWallet(-stake);

      // Reset stake and show success
      setStakes(prev => ({ ...prev, [betType]: '' }));
      toast.success(`Bet placed! Potential winnings: KES ${potentialWinnings.toFixed(2)}`);

    } catch (error) {
      console.error('Error placing bet:', error);
      toast.error('Failed to place bet. Please try again.');
    } finally {
      setBettingOn(null);
    }
  };

  const confidence = getConfidenceBadge(game.confidence);

  return (
    <Card className="shadow-betting hover:shadow-glow transition-all duration-300 animate-fade-in overflow-hidden">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gradient-primary rounded flex items-center justify-center">
              <Trophy className="h-2 w-2 sm:h-3 sm:w-3 text-white" />
            </div>
            <CardTitle className="text-base sm:text-lg">{game.league}</CardTitle>
          </div>
          <Badge className={`${confidence.className} text-xs sm:text-sm`}>
            {confidence.text}
          </Badge>
        </div>
        
        {/* Match Info */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center space-x-2 text-xs sm:text-sm text-muted-foreground">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span>{formatDate(game.kickOffTime)}</span>
          </div>
          <div className="text-xs text-muted-foreground">
            {formatTime(game.kickOffTime)}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4 sm:space-y-6 px-4 sm:px-6">
        {/* Teams */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 min-w-0">
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
              {game.homeTeam.logo}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground text-sm sm:text-base truncate">{game.homeTeam.name}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Home Team</div>
            </div>
          </div>
          
          <div className="text-center mx-2 sm:mx-4 flex-shrink-0">
            <div className="text-lg sm:text-2xl font-bold text-primary">VS</div>
            <div className="text-xs text-muted-foreground">Match</div>
          </div>
          
          <div className="flex items-center space-x-2 sm:space-x-3 flex-1 justify-end min-w-0">
            <div className="flex-1 text-right min-w-0">
              <div className="font-semibold text-foreground text-sm sm:text-base truncate">{game.awayTeam.name}</div>
              <div className="text-xs sm:text-sm text-muted-foreground">Away Team</div>
            </div>
            <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gradient-primary rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
              {game.awayTeam.logo}
            </div>
          </div>
        </div>

        {/* Odds and Betting */}
        <div className="space-y-4">
          <div className="text-center">
            <Label className="text-xs sm:text-sm font-medium text-muted-foreground">Place Your Bets</Label>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            {/* Home Win */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-base sm:text-lg font-bold text-primary">{game.odds.home}</div>
                <div className="text-xs text-muted-foreground">Home Win</div>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Stake amount"
                  value={stakes.home}
                  onChange={(e) => setStakes(prev => ({ ...prev, home: e.target.value }))}
                  className="text-center text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                <Button
                  variant="betting"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => handleBet('home')}
                  disabled={!stakes.home || bettingOn === 'home'}
                >
                  {bettingOn === 'home' ? 'Placing...' : `Bet on ${game.homeTeam.name}`}
                </Button>
              </div>
            </div>

            {/* Draw */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center p-2 sm:p-3 bg-warning/5 rounded-lg border border-warning/10">
                <div className="text-base sm:text-lg font-bold text-warning">{game.odds.draw}</div>
                <div className="text-xs text-muted-foreground">Draw</div>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Stake amount"
                  value={stakes.draw}
                  onChange={(e) => setStakes(prev => ({ ...prev, draw: e.target.value }))}
                  className="text-center text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                <Button
                  variant="betting"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => handleBet('draw')}
                  disabled={!stakes.draw || bettingOn === 'draw'}
                >
                  {bettingOn === 'draw' ? 'Placing...' : 'Bet on Draw'}
                </Button>
              </div>
            </div>

            {/* Away Win */}
            <div className="space-y-2 sm:space-y-3">
              <div className="text-center p-2 sm:p-3 bg-primary/5 rounded-lg border border-primary/10">
                <div className="text-base sm:text-lg font-bold text-primary">{game.odds.away}</div>
                <div className="text-xs text-muted-foreground">Away Win</div>
              </div>
              <div className="space-y-2">
                <Input
                  type="number"
                  placeholder="Stake amount"
                  value={stakes.away}
                  onChange={(e) => setStakes(prev => ({ ...prev, away: e.target.value }))}
                  className="text-center text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                />
                <Button
                  variant="betting"
                  className="w-full text-xs sm:text-sm h-8 sm:h-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  onClick={() => handleBet('away')}
                  disabled={!stakes.away || bettingOn === 'away'}
                >
                  {bettingOn === 'away' ? 'Placing...' : `Bet on ${game.awayTeam.name}`}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Potential Winnings Info */}
        <div className="text-center p-3 bg-success/5 rounded-lg border border-success/10">
          <div className="flex items-center justify-center space-x-2">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4 text-success" />
            <span className="text-xs sm:text-sm font-medium text-success">Potential Winnings</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            Enter stake amount to see potential winnings
          </div>
        </div>
      </CardContent>
    </Card>
  );
};