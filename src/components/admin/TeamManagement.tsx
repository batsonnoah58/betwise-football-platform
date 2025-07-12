import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Users, Plus, Edit, Trash2, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface Team {
  id: number;
  name: string;
  logo: string;
  leagueId: number;
  leagueName: string;
}

interface League {
  id: number;
  name: string;
}

export const TeamManagement: React.FC = () => {
  const [teams, setTeams] = useState<Team[]>([]);
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    logo: '⚽',
    leagueId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch teams with league information
      const { data: teamsData, error: teamsError } = await supabase
        .from('teams')
        .select(`
          id,
          name,
          logo,
          league_id,
          leagues(name)
        `)
        .order('name');

      if (teamsError) throw teamsError;

      // Fetch leagues
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select('*')
        .order('name');

      if (leaguesError) throw leaguesError;

      // Transform teams data
      const transformedTeams: Team[] = teamsData?.map(team => ({
        id: team.id,
        name: team.name,
        logo: team.logo || '⚽',
        leagueId: team.league_id,
        leagueName: team.leagues.name
      })) || [];

      setTeams(transformedTeams);
      setLeagues(leaguesData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load teams data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.leagueId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const teamData = {
        name: formData.name,
        logo: formData.logo,
        league_id: parseInt(formData.leagueId)
      };

      if (editingTeam) {
        // Update existing team
        const { error } = await supabase
          .from('teams')
          .update(teamData)
          .eq('id', editingTeam.id);

        if (error) throw error;
        toast.success('Team updated successfully');
      } else {
        // Add new team
        const { error } = await supabase
          .from('teams')
          .insert(teamData);

        if (error) throw error;
        toast.success('Team added successfully');
      }

      setShowAddDialog(false);
      setEditingTeam(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving team:', error);
      toast.error('Failed to save team');
    }
  };

  const handleDelete = async (teamId: number) => {
    if (!confirm('Are you sure you want to delete this team? This will also delete all associated games.')) return;

    try {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', teamId);

      if (error) throw error;
      toast.success('Team deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting team:', error);
      toast.error('Failed to delete team');
    }
  };

  const handleEdit = (team: Team) => {
    setEditingTeam(team);
    setFormData({
      name: team.name,
      logo: team.logo,
      leagueId: team.leagueId.toString()
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      logo: '⚽',
      leagueId: ''
    });
  };

  const teamLogos = [
    '⚽', '🔴', '🔵', '⚪', '⚫', '🟡', '🟢', '🟣', '🟠', '🔶', '🔷', '💎', '🌟', '🔥', '⚡', '💫'
  ];

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-betting">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading teams...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Teams Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage football teams</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New Team</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {teams.map((team) => (
          <Card key={team.id} className="shadow-betting">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">{team.logo}</div>
                  <div>
                    <h3 className="font-semibold text-lg">{team.name}</h3>
                    <p className="text-muted-foreground text-sm">{team.leagueName}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(team)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(team.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {teams.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No teams found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first team to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>Add New Team</Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit Team Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingTeam(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5 text-primary" />
              <span>{editingTeam ? 'Edit Team' : 'Add New Team'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingTeam ? 'Update team details' : 'Create a new football team'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Team Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter team name"
                required
              />
            </div>

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
              <Label>Team Logo</Label>
              <div className="grid grid-cols-8 gap-2">
                {teamLogos.map((logo, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, logo }))}
                    className={`p-2 text-lg rounded border-2 transition-all ${
                      formData.logo === logo 
                        ? 'border-primary bg-primary/10' 
                        : 'border-border hover:border-primary/50'
                    }`}
                  >
                    {logo}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingTeam(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingTeam ? 'Update Team' : 'Add Team'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 