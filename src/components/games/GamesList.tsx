import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { GameCard } from './GameCard';

interface Game {
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
}

export const GamesList: React.FC = () => {
  const [selectedLeague, setSelectedLeague] = useState<string>('all');

  // Use React Query for data fetching with caching
  const { data: gamesData, isLoading } = useQuery({
    queryKey: ['games'],
    queryFn: async () => {
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
          league:leagues(name)
        `)
        .eq('status', 'upcoming')
        .order('kick_off_time', { ascending: true });

      if (gamesError) {
        console.error('Error fetching games:', gamesError);
        return [];
      }

      // Transform data to match component interface
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
        league: game.league.name,
        kickOffTime: game.kick_off_time,
        odds: {
          home: Number(game.odds_home),
          draw: Number(game.odds_draw),
          away: Number(game.odds_away)
        },
        status: game.status,
        confidence: game.confidence
      })) || [];

      return transformedGames;
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

  // Get unique leagues from cached data
  const leagues = React.useMemo(() => {
    if (!gamesData) return ['all'];
    const uniqueLeagues = Array.from(new Set(gamesData.map(game => game.league)));
    return ['all', ...uniqueLeagues];
  }, [gamesData]);

  // Filter games based on selected league
  const filteredGames = React.useMemo(() => {
    if (!gamesData) return [];
    return selectedLeague === 'all' 
      ? gamesData 
      : gamesData.filter(game => game.league === selectedLeague);
  }, [gamesData, selectedLeague]);

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <Card className="shadow-betting">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">Today's Games</CardTitle>
              <p className="text-muted-foreground">
                Place your bets on upcoming matches
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <Select value={selectedLeague} onValueChange={setSelectedLeague}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by league" />
                </SelectTrigger>
                <SelectContent>
                  {leagues.map((league) => (
                    <SelectItem key={league} value={league}>
                      {league === 'all' ? 'All Leagues' : league}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredGames.length > 0 ? (
            <div className="grid gap-6">
              {filteredGames.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-4xl mb-4">⚽</div>
              <h3 className="text-lg font-semibold mb-2">No games available</h3>
              <p className="text-muted-foreground">
                {selectedLeague === 'all' 
                  ? 'No upcoming games at the moment.' 
                  : `No games found for ${selectedLeague}.`}
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};