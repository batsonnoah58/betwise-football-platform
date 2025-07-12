import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Card, CardContent } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Clock, MapPin, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Game {
  id: number;
  homeTeam: { name: string; logo: string };
  awayTeam: { name: string; logo: string };
  league: string;
  kickOffTime: string;
  odds: { home: number; draw: number; away: number };
  status: string;
  confidence: string;
}

interface GameCardProps {
  game: Game;
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
    <Card className="shadow-betting hover:shadow-glow transition-all duration-300 border border-primary/10">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <Badge className={confidence.className}>
              {confidence.text}
            </Badge>
            <Badge variant="outline">{game.league}</Badge>
          </div>
          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
            <Clock className="h-3 w-3" />
            <span>{formatTime(game.kickOffTime)}</span>
          </div>
        </div>

        <div className="flex items-center justify-center space-x-4 mb-6">
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{game.homeTeam.logo}</div>
            <div className="font-semibold text-sm">{game.homeTeam.name}</div>
          </div>
          
          <div className="text-center px-4">
            <div className="text-lg font-bold text-muted-foreground">VS</div>
          </div>
          
          <div className="text-center flex-1">
            <div className="text-2xl mb-1">{game.awayTeam.logo}</div>
            <div className="font-semibold text-sm">{game.awayTeam.name}</div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-3">
          {/* Home Win */}
          <div className="bg-betting-background border border-primary/20 rounded-lg p-3 hover:bg-betting-hover transition-colors">
            <div className="text-center mb-2">
              <div className="text-xs text-muted-foreground mb-1">Home Win</div>
              <div className="text-lg font-bold text-primary">{game.odds.home}</div>
            </div>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Stake"
                value={stakes.home}
                onChange={(e) => setStakes(prev => ({ ...prev, home: e.target.value }))}
                className="text-xs h-8"
                min="10"
                max={user?.walletBalance || 0}
              />
              <Button
                size="sm"
                variant="betting"
                onClick={() => handleBet('home')}
                disabled={!stakes.home}
                className="w-full text-xs h-7"
              >
                Bet
              </Button>
            </div>
          </div>

          {/* Draw */}
          <div className="bg-betting-background border border-primary/20 rounded-lg p-3 hover:bg-betting-hover transition-colors">
            <div className="text-center mb-2">
              <div className="text-xs text-muted-foreground mb-1">Draw</div>
              <div className="text-lg font-bold text-primary">{game.odds.draw}</div>
            </div>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Stake"
                value={stakes.draw}
                onChange={(e) => setStakes(prev => ({ ...prev, draw: e.target.value }))}
                className="text-xs h-8"
                min="10"
                max={user?.walletBalance || 0}
              />
              <Button
                size="sm"
                variant="betting"
                onClick={() => handleBet('draw')}
                disabled={!stakes.draw}
                className="w-full text-xs h-7"
              >
                Bet
              </Button>
            </div>
          </div>

          {/* Away Win */}
          <div className="bg-betting-background border border-primary/20 rounded-lg p-3 hover:bg-betting-hover transition-colors">
            <div className="text-center mb-2">
              <div className="text-xs text-muted-foreground mb-1">Away Win</div>
              <div className="text-lg font-bold text-primary">{game.odds.away}</div>
            </div>
            <div className="space-y-2">
              <Input
                type="number"
                placeholder="Stake"
                value={stakes.away}
                onChange={(e) => setStakes(prev => ({ ...prev, away: e.target.value }))}
                className="text-xs h-8"
                min="10"
                max={user?.walletBalance || 0}
              />
              <Button
                size="sm"
                variant="betting"
                onClick={() => handleBet('away')}
                disabled={!stakes.away}
                className="w-full text-xs h-7"
              >
                Bet
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-border">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <div className="flex items-center space-x-1">
              <MapPin className="h-3 w-3" />
              <span>Match ID: #{game.id}</span>
            </div>
            <div className="flex items-center space-x-1">
              <TrendingUp className="h-3 w-3" />
              <span>Live odds</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};