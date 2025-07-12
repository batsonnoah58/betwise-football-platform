import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Trophy, Plus, Edit, Trash2, Calendar, Clock } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: number;
  name: string;
  logo: string;
}

interface League {
  id: number;
  name: string;
}

interface Game {
  id: number;
  homeTeam: Team;
  awayTeam: Team;
  league: League;
  kickOffTime: string;
  oddsHome: number;
  oddsDraw: number;
  oddsAway: number;
  status: string;
  confidence: string;
}

export const GameManagement: React.FC = () => {
  const [games, setGames] = useState<Game[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingGame, setEditingGame] = useState<Game | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    homeTeamId: '',
    awayTeamId: '',
    leagueId: '',
    kickOffTime: '',
    oddsHome: '',
    oddsDraw: '',
    oddsAway: '',
    confidence: 'medium'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch games with related data
      const { data: gamesData, error: gamesError } = await supabase
        .from('games')
        .select(`
          id,
          kick_off_time,
          odds_home,
          odds_draw,
          odds_away,
          status,
          confidence,
          home_team:teams!games_home_team_id_fkey(id, name, logo),
          away_team:teams!games_away_team_id_fkey(id, name, logo),
          league:leagues(id, name)
        `)
        .order('kick_off_time', { ascending: true });

      if (gamesError) throw gamesError;

      // Fetch teams
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select('*')
        .order('name');

      if (teamsError) throw teamsError;

      // Fetch leagues
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (leaguesError) throw leaguesError;

      // Transform games data
      const transformedGames: Game[] = gamesData?.map(game => ({
        id: game.id,
        homeTeam: {
          id: game.home_team.id,
          name: game.home_team.name,
          logo: game.home_team.logo || '⚽'
        },
        awayTeam: {
          id: game.away_team.id,
          name: game.away_team.name,
          logo: game.away_team.logo || '⚽'
        },
        league: {
          id: game.league.id,
          name: game.league.name
        },
        kickOffTime: game.kick_off_time,
        oddsHome: Number(game.odds_home),
        oddsDraw: Number(game.odds_draw),
        oddsAway: Number(game.odds_away),
        status: game.status,
        confidence: game.confidence
      })) || [];

      setGames(transformedGames);
      setTeams(teamsData || []);
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load games data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.homeTeamId || !formData.awayTeamId || !formData.leagueId || !formData.kickOffTime) {
      toast.error('Please fill in all required fields');
      return;
    }

    if (formData.homeTeamId === formData.awayTeamId) {
      toast.error('Home and away teams cannot be the same');
      return;
    }

    try {
      const gameData = {
        home_team_id: parseInt(formData.homeTeamId),
        away_team_id: parseInt(formData.awayTeamId),
        league_id: parseInt(formData.leagueId),
        kick_off_time: formData.kickOffTime,
        odds_home: parseFloat(formData.oddsHome) || 0,
        odds_draw: parseFloat(formData.oddsDraw) || 0,
        odds_away: parseFloat(formData.oddsAway) || 0,
        confidence: formData.confidence,
        status: 'upcoming'
      };

      if (editingGame) {
        // Update existing game
        const { error } = await supabase
          .from('games')
          .update(gameData)
          .eq('id', editingGame.id);

        if (error) throw error;
        toast.success('Game updated successfully');
      } else {
        // Add new game
        const { error } = await supabase
          .from('games')
          .insert(gameData);

        if (error) throw error;
        toast.success('Game added successfully');
      }

      setShowAddDialog(false);
      setEditingGame(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving game:', error);
      toast.error('Failed to save game');
    }
  };

  const handleDelete = async (gameId: number) => {
    if (!confirm('Are you sure you want to delete this game?')) return;

    try {
      const { error } = await supabase
        .from('games')
        .delete()
        .eq('id', gameId);

      if (error) throw error;
      toast.success('Game deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting game:', error);
      toast.error('Failed to delete game');
    }
  };

  const handleEdit = (game: Game) => {
    setEditingGame(game);
    setFormData({
      homeTeamId: game.homeTeam.id.toString(),
      awayTeamId: game.awayTeam.id.toString(),
      leagueId: game.league.id.toString(),
      kickOffTime: game.kickOffTime.slice(0, 16), // Format for datetime-local input
      oddsHome: game.oddsHome.toString(),
      oddsDraw: game.oddsDraw.toString(),
      oddsAway: game.oddsAway.toString(),
      confidence: game.confidence
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      homeTeamId: '',
      awayTeamId: '',
      leagueId: '',
      kickOffTime: '',
      oddsHome: '',
      oddsDraw: '',
      oddsAway: '',
      confidence: 'medium'
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
          <h2 className="text-2xl font-bold text-primary">Games Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage football games</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Game</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {games.map((game) => (
          <Card key={game.id} className="shadow-betting">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl mb-1">{game.homeTeam.logo}</div>
                    <div className="font-semibold text-sm">{game.homeTeam.name}</div>
                  </div>
                  
                  <div className="text-center px-4">
                    <div className="text-lg font-bold text-muted-foreground">VS</div>
                    <div className="text-xs text-muted-foreground">{game.league.name}</div>
                  </div>
                  
                  <div className="text-center">
                    <div className="text-2xl mb-1">{game.awayTeam.logo}</div>
                    <div className="font-semibold text-sm">{game.awayTeam.name}</div>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDateTime(game.kickOffTime)}</span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Odds: {game.oddsHome} | {game.oddsDraw} | {game.oddsAway}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant={getStatusBadge(game.status).variant}
                      className={getStatusBadge(game.status).className}
                    >
                      {game.status}
                    </Badge>
                    <Badge variant="outline">{game.confidence}</Badge>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleEdit(game)}
                    >
                      <Edit className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDelete(game.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
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
            <p className="text-muted-foreground mb-4">
              Add your first game to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>Add New Game</Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Game Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingGame(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>{editingGame ? 'Edit Game' : 'Add New Game'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingGame ? 'Update game details and odds' : 'Create a new football game with betting odds'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="league">League *</Label>
                <Select value={formData.leagueId} onValueChange={(value) => setFormData(prev => ({ ...prev, leagueId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select league" />
                  </SelectTrigger>
                  <SelectContent>
                    {leagues.map((league) => (
                      <SelectItem key={league.id} value={league.id.toString()}>
                        {league.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="kickOffTime">Kick-off Time *</Label>
                <Input
                  id="kickOffTime"
                  type="datetime-local"
                  value={formData.kickOffTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, kickOffTime: e.target.value }))}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="homeTeam">Home Team *</Label>
                <Select value={formData.homeTeamId} onValueChange={(value) => setFormData(prev => ({ ...prev, homeTeamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select home team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="awayTeam">Away Team *</Label>
                <Select value={formData.awayTeamId} onValueChange={(value) => setFormData(prev => ({ ...prev, awayTeamId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select away team" />
                  </SelectTrigger>
                  <SelectContent>
                    {teams.map((team) => (
                      <SelectItem key={team.id} value={team.id.toString()}>
                        {team.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="oddsHome">Home Win Odds</Label>
                <Input
                  id="oddsHome"
                  type="number"
                  step="0.1"
                  min="1"
                  value={formData.oddsHome}
                  onChange={(e) => setFormData(prev => ({ ...prev, oddsHome: e.target.value }))}
                  placeholder="2.5"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oddsDraw">Draw Odds</Label>
                <Input
                  id="oddsDraw"
                  type="number"
                  step="0.1"
                  min="1"
                  value={formData.oddsDraw}
                  onChange={(e) => setFormData(prev => ({ ...prev, oddsDraw: e.target.value }))}
                  placeholder="3.2"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="oddsAway">Away Win Odds</Label>
                <Input
                  id="oddsAway"
                  type="number"
                  step="0.1"
                  min="1"
                  value={formData.oddsAway}
                  onChange={(e) => setFormData(prev => ({ ...prev, oddsAway: e.target.value }))}
                  placeholder="2.8"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confidence">Confidence Level</Label>
              <Select value={formData.confidence} onValueChange={(value) => setFormData(prev => ({ ...prev, confidence: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select confidence level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="very-high">🔥 Very High</SelectItem>
                  <SelectItem value="high">⭐ High</SelectItem>
                  <SelectItem value="medium">📊 Medium</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingGame(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingGame ? 'Update Game' : 'Add Game'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 