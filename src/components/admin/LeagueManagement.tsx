import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Calendar, Plus, Edit, Trash2, Trophy } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface League {
  id: number;
  name: string;
  teamCount: number;
  gameCount: number;
}

export const LeagueManagement: React.FC = () => {
  const [leagues, setLeagues] = useState<League[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingLeague, setEditingLeague] = useState<League | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Form state
  const [formData, setFormData] = useState({
    name: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch leagues with team and game counts
      const { data: leaguesData, error: leaguesError } = await supabase
        .from('leagues')
        .select(`
          id,
          name,
          teams(count),
          games(count)
        `)
        .order('name');

      if (leaguesError) throw leaguesError;

      // Transform leagues data
      const transformedLeagues: League[] = leaguesData?.map(league => ({
        id: league.id,
        name: league.name,
        teamCount: league.teams?.[0]?.count || 0,
        gameCount: league.games?.[0]?.count || 0
      })) || [];

      setLeagues(transformedLeagues);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load leagues data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Please enter a league name');
      return;
    }

    try {
      const leagueData = {
        name: formData.name.trim()
      };

      if (editingLeague) {
        // Update existing league
        const { error } = await supabase
          .from('leagues')
          .update(leagueData)
          .eq('id', editingLeague.id);

        if (error) throw error;
        toast.success('League updated successfully');
      } else {
        // Add new league
        const { error } = await supabase
          .from('leagues')
          .insert(leagueData);

        if (error) throw error;
        toast.success('League added successfully');
      }

      setShowAddDialog(false);
      setEditingLeague(null);
      resetForm();
      fetchData();
    } catch (error) {
      console.error('Error saving league:', error);
      toast.error('Failed to save league');
    }
  };

  const handleDelete = async (leagueId: number) => {
    if (!confirm('Are you sure you want to delete this league? This will also delete all associated teams and games.')) return;

    try {
      const { error } = await supabase
        .from('leagues')
        .delete()
        .eq('id', leagueId);

      if (error) throw error;
      toast.success('League deleted successfully');
      fetchData();
    } catch (error) {
      console.error('Error deleting league:', error);
      toast.error('Failed to delete league');
    }
  };

  const handleEdit = (league: League) => {
    setEditingLeague(league);
    setFormData({
      name: league.name
    });
    setShowAddDialog(true);
  };

  const resetForm = () => {
    setFormData({
      name: ''
    });
  };

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-betting">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading leagues...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">Leagues Management</h2>
          <p className="text-muted-foreground">Add, edit, and manage football leagues</p>
        </div>
        <Button onClick={() => setShowAddDialog(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add New League</span>
        </Button>
      </div>

      <div className="grid gap-4">
        {leagues.map((league) => (
          <Card key={league.id} className="shadow-betting">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">🏆</div>
                  <div>
                    <h3 className="font-semibold text-lg">{league.name}</h3>
                    <div className="flex items-center space-x-4 mt-1">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {league.teamCount} Teams
                      </span>
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold text-foreground">
                        {league.gameCount} Games
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEdit(league)}
                  >
                    <Edit className="h-3 w-3" />
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDelete(league.id)}
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

      {leagues.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No leagues found</h3>
            <p className="text-muted-foreground mb-4">
              Add your first league to get started.
            </p>
            <Button onClick={() => setShowAddDialog(true)}>Add New League</Button>
          </CardContent>
        </Card>
      )}

      {/* Add/Edit League Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(open) => {
        if (!open) {
          setShowAddDialog(false);
          setEditingLeague(null);
          resetForm();
        }
      }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-primary" />
              <span>{editingLeague ? 'Edit League' : 'Add New League'}</span>
            </DialogTitle>
            <DialogDescription>
              {editingLeague ? 'Update league details' : 'Create a new football league'}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">League Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter league name"
                required
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <Button type="button" variant="outline" onClick={() => {
                setShowAddDialog(false);
                setEditingLeague(null);
                resetForm();
              }} className="flex-1">
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {editingLeague ? 'Update League' : 'Add League'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}; 