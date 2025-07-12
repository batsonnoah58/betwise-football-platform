import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { CheckCircle, Clock, Trophy, DollarSign, Users, AlertCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Game {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  kickOffTime: string;
  status: string;
  result: string;
  totalBets: number;
  totalStake: number;
}

interface GameBet {
  id: number;
  userId: string;
  userName: string;
  stake: number;
  odds: number;
  betOn: string;
  potentialWinnings: number;
  status: string;
}

export const ResultManagement: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [selectedGame, setSelectedGame] = useState<Game | null>(null);
  const [gameBets, setGameBets] = useState<GameBet[]>([]);
  const [showResultDialog, setShowResultDialog] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    result: '',
    homeScore: '',
    awayScore: ''
  });

  useEffect(() => {
    fetchGames();
  }, []);

  const fetchGames = async () => {
    try {
      // Fetch games with team information and betting stats
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          id,
          kick_off_time,
          status,
          result,
          home_team:teams!games_home_team_id_fkey(name),
          away_team:teams!games_away_team_id_fkey(name),
          leagues(name)
        `)
        .order('kick_off_time', { ascending: false });

      if (gamesError) throw gamesError;

      // Transform games data and fetch betting stats
      const gamesWithStats = await Promise.all(
        gamesData?.map(async (game) => {
          const { data: betsData } = await supabase
            .from('bets')
            .select('stake')
            .eq('game_id', game.id);

          const totalBets = betsData?.length || 0;
          const totalStake = betsData?.reduce((sum, bet) => sum + Number(bet.stake), 0) || 0;

          return {
            id: game.id,
            homeTeam: game.home_team.name,
            awayTeam: game.away_team.name,
            league: game.leagues.name,
            kickOffTime: game.kick_off_time,
            status: game.status,
            result: game.result,
            totalBets,
            totalStake
          };
        }) || []
      );

      setGames(gamesWithStats);
    } catch (error) {
      console.error('Error fetching games:', error);
      toast.error('Failed to load games data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGameBets = async (gameId: number) => {
    try {
      const { data: betsData, error: betsError } = await supabase
        .from('bets')
        .select(`
          id,
          stake,
          odds,
          bet_on,
          status,
          potential_winnings,
          profiles(full_name)
        `)
        .eq('game_id', gameId);

      if (betsError) throw betsError;

      const transformedBets: GameBet[] = betsData?.map(bet => ({
        id: bet.id,
        userId: '', // We don't need this for display
        userName: bet.profiles.full_name,
        stake: Number(bet.stake),
        odds: Number(bet.odds),
        betOn: bet.bet_on,
        potentialWinnings: Number(bet.potential_winnings),
        status: bet.status
      })) || [];

      setGameBets(transformedBets);
    } catch (error) {
      console.error('Error fetching game bets:', error);
      toast.error('Failed to load betting data');
    }
  };

  const handleUpdateResult = async (game: Game) => {
    setSelectedGame(game);
    await fetchGameBets(game.id);
    setShowResultDialog(true);
  };

  const handleSubmitResult = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.result || !formData.homeScore || !formData.awayScore) {
      toast.error('Please fill in all fields');
      return;
    }

    if (!selectedGame) return;

    setIsProcessing(true);

    try {
      // Update game result
      const { error: gameError } = await supabase
        .from('games')
        .update({
          result: formData.result,
          status: 'finished'
        })
        .eq('id', selectedGame.id);

      if (gameError) throw gameError;

      // Process payouts for winning bets
      const winningBets = gameBets.filter(bet => {
        const betResult = bet.betOn;
        const gameResult = formData.result;
        return (
          (betResult === 'home_win' && gameResult === 'home_win') ||
          (betResult === 'draw' && gameResult === 'draw') ||
          (betResult === 'away_win' && gameResult === 'away_win')
        );
      });

      // Update bet statuses and process payouts
      for (const bet of gameBets) {
        const isWinner = winningBets.some(winningBet => winningBet.id === bet.id);
        const newStatus = isWinner ? 'won' : 'lost';

        // Update bet status
        await supabase
          .from('bets')
          .update({ status: newStatus })
          .eq('id', bet.id);

        // Process payout for winners
        if (isWinner) {
          // Add winnings to user wallet
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', bet.userId)
            .single();

          if (currentProfile) {
            const newBalance = Number(currentProfile.wallet_balance) + bet.potentialWinnings;
            await supabase
              .from('profiles')
              .update({ wallet_balance: newBalance })
              .eq('id', bet.userId);
          }

          // Add transaction record
          await supabase
            .from('transactions')
            .insert({
              user_id: bet.userId,
              type: 'bet_won',
              amount: bet.potentialWinnings,
              description: `Winnings from bet on ${selectedGame.homeTeam} vs ${selectedGame.awayTeam}`
            });
        }
      }

      toast.success(`Game result updated! ${winningBets.length} winning bets processed.`);
      setShowResultDialog(false);
      setSelectedGame(null);
      resetForm();
      fetchGames();
    } catch (error) {
      console.error('Error updating game result:', error);
      toast.error('Failed to update game result');
    } finally {
      setIsProcessing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      result: '',
      homeScore: '',
      awayScore: ''
    });
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      'upcoming': { variant: 'secondary' as const, className: '' },
      'live': { variant: 'default' as const, className: 'bg-gradient-success' },
      'finished': { variant: 'outline' as const, className: '' }
    };
    return variants[status as keyof typeof variants] || variants.upcoming;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-betting">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading games...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Result Management</h2>
          <p className="text-muted-foreground">Update game results and process payouts</p>
        </div>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <Card key={game.id} className="shadow-betting">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚽</div>
                    <div className="font-semibold text-sm">{game.homeTeam}</div>
                  </div>
                  
                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-muted-foreground">VS</div>
                    <div className="text-xs text-muted-foreground">{game.league}</div>
                    <div className="text-xs text-muted-foreground">{formatDateTime(game.kickOffTime)}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">⚽</div>
                    <div className="font-semibold text-sm">{game.awayTeam}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Bets</div>
                    <div className="text-lg font-semibold">{game.totalBets}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Stake</div>
                    <div className="text-lg font-semibold">{formatCurrency(game.totalStake)}</div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${
                      game.status === 'live' ? 'bg-gradient-success text-white' : 
                      game.status === 'upcoming' ? 'bg-secondary text-secondary-foreground' : 
                      'text-foreground'
                    }`}>
                      {game.status}
                    </span>
                    
                    {game.result !== 'pending' && (
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                        {game.result.replace('_', ' ').toUpperCase()}
                      </span>
                    )}
                  </div>

                  {game.status === 'finished' ? (
                    <Button size="sm" variant="outline" disabled>
                      <CheckCircle className="h-3 w-3 mr-2" />
                      Completed
                    </Button>
                  ) : (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleUpdateResult(game)}
                    >
                      <Trophy className="h-3 w-3 mr-2" />
                      Update Result
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {games.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Trophy className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No games found</h3>
            <p className="text-muted-foreground">
              No games are available for result management.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Update Result Dialog */}
      <Dialog open={showResultDialog} onOpenChange={setShowResultDialog}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>Update Game Result</span>
            </DialogTitle>
            <DialogDescription>
              Set the final result and scores for {selectedGame?.homeTeam} vs {selectedGame?.awayTeam}
            </DialogDescription>
          </DialogHeader>

          {selectedGame && (
            <div className="space-y-6">
              <form onSubmit={handleSubmitResult} className="space-y-4">
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="homeScore">Home Team Score</Label>
                    <Input
                      id="homeScore"
                      type="number"
                      min="0"
                      value={formData.homeScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, homeScore: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="awayScore">Away Team Score</Label>
                    <Input
                      id="awayScore"
                      type="number"
                      min="0"
                      value={formData.awayScore}
                      onChange={(e) => setFormData(prev => ({ ...prev, awayScore: e.target.value }))}
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="result">Match Result</Label>
                    <Select value={formData.result} onValueChange={(value) => setFormData(prev => ({ ...prev, result: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select result" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="home_win">Home Win</SelectItem>
                        <SelectItem value="draw">Draw</SelectItem>
                        <SelectItem value="away_win">Away Win</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Betting Summary */}
                <div className="bg-muted/50 p-4 rounded-lg">
                  <h4 className="font-semibold mb-3">Betting Summary</h4>
                  <div className="grid grid-cols-3 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Total Bets</div>
                      <div className="font-semibold">{gameBets.length}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Total Stake</div>
                      <div className="font-semibold">{formatCurrency(gameBets.reduce((sum, bet) => sum + bet.stake, 0))}</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Potential Payouts</div>
                      <div className="font-semibold">{formatCurrency(gameBets.reduce((sum, bet) => sum + bet.potentialWinnings, 0))}</div>
                    </div>
                  </div>
                </div>

                <div className="flex space-x-3 pt-4">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowResultDialog(false);
                    setSelectedGame(null);
                    resetForm();
                  }} className="flex-1">
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isProcessing} className="flex-1">
                    {isProcessing ? 'Processing...' : 'Update Result & Process Payouts'}
                  </Button>
                </div>
              </form>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 