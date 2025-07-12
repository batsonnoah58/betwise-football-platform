import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Users, Search, Eye, DollarSign, Calendar, TrendingUp, TrendingDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  email: string;
  walletBalance: number;
  dailyAccessGrantedUntil?: string;
  totalBets: number;
  totalWinnings: number;
  totalLosses: number;
  isAdmin: boolean;
}

interface UserBet {
  id: number;
  gameId: number;
  stake: number;
  odds: number;
  betOn: string;
  status: string;
  potentialWinnings: number;
  placedAt: string;
  gameDetails: {
    homeTeam: string;
    awayTeam: string;
    league: string;
  };
}

export const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // First, fetch basic user profiles with all columns
      const { data: usersData, error: usersError } = await supabase
        .from('profiles')
        .select('*')
        .order('id');

      if (usersError) throw usersError;

      // Transform users data
      const transformedUsers: User[] = usersData?.map(user => ({
        id: user.id,
        fullName: user.full_name || 'Unknown User',
        email: '', // No email in profiles table
        walletBalance: Number(user.wallet_balance || 0),
        dailyAccessGrantedUntil: user.daily_access_granted_until,
        totalBets: 0,
        totalWinnings: 0,
        totalLosses: 0,
        isAdmin: false // We'll check this separately
      })) || [];

      // Check admin roles for each user
      const usersWithRoles = await Promise.all(
        transformedUsers.map(async (user) => {
          const { data: rolesData } = await supabase
            .from('user_roles')
            .select('role')
            .eq('user_id', user.id);

          const isAdmin = rolesData?.some((role: any) => role.role === 'admin') || false;

          return {
            ...user,
            isAdmin
          };
        })
      );

      // Get betting statistics (simplified)
      const usersWithStats = await Promise.all(
        usersWithRoles.map(async (user) => {
          const { data: betsData } = await supabase
            .from('bets')
            .select('stake, odds, status, potential_winnings')
            .eq('user_id', user.id);

          const totalBets = betsData?.length || 0;
          const totalWinnings = betsData?.filter(bet => bet.status === 'won')
            .reduce((sum, bet) => sum + Number(bet.potential_winnings || 0), 0) || 0;
          const totalLosses = betsData?.filter(bet => bet.status === 'lost')
            .reduce((sum, bet) => sum + Number(bet.stake || 0), 0) || 0;

          return {
            ...user,
            totalBets,
            totalWinnings,
            totalLosses
          };
        })
      );

      setUsers(usersWithStats);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users data');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUserBets = async (userId: string) => {
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
          placed_at
        `)
        .eq('user_id', userId)
        .order('placed_at', { ascending: false });

      if (betsError) throw betsError;

      const transformedBets: UserBet[] = betsData?.map(bet => ({
        id: bet.id,
        gameId: 0,
        stake: Number(bet.stake || 0),
        odds: Number(bet.odds || 0),
        betOn: bet.bet_on || 'unknown',
        status: bet.status || 'active',
        potentialWinnings: Number(bet.potential_winnings || 0),
        placedAt: bet.placed_at || new Date().toISOString(),
        gameDetails: {
          homeTeam: 'Team A',
          awayTeam: 'Team B',
          league: 'Unknown League'
        }
      })) || [];

      setUserBets(transformedBets);
    } catch (error) {
      console.error('Error fetching user bets:', error);
      toast.error('Failed to load user betting history');
    }
  };

  const handleViewUserDetails = async (user: User) => {
    setSelectedUser(user);
    await fetchUserBets(user.id);
    setShowUserDetails(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const filteredUsers = users.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="space-y-6 animate-fade-in">
        <Card className="shadow-betting">
          <CardContent className="text-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Loading users...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-primary">User Management</h2>
          <p className="text-muted-foreground">View and manage user accounts and betting history</p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => (
          <Card key={user.id} className="shadow-betting">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="text-3xl">👤</div>
                  <div>
                    <h3 className="font-semibold text-lg">{user.fullName}</h3>
                    <p className="text-muted-foreground text-sm">{user.email}</p>
                    <div className="flex items-center space-x-4 mt-2">
                      <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-secondary text-secondary-foreground">
                        {user.totalBets} Bets
                      </span>
                      {user.isAdmin && (
                        <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold bg-primary text-primary-foreground">
                          Admin
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-6">
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Wallet Balance</div>
                    <div className="text-lg font-semibold text-primary">{formatCurrency(user.walletBalance)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Winnings</div>
                    <div className="text-lg font-semibold text-success">{formatCurrency(user.totalWinnings)}</div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-sm text-muted-foreground">Total Losses</div>
                    <div className="text-lg font-semibold text-destructive">{formatCurrency(user.totalLosses)}</div>
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewUserDetails(user)}
                  >
                    <Eye className="h-3 w-3 mr-2" />
                    View Details
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredUsers.length === 0 && (
        <Card className="shadow-card">
          <CardContent className="text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No users found</h3>
            <p className="text-muted-foreground">
              {searchTerm ? 'Try adjusting your search terms.' : 'No users have registered yet.'}
            </p>
          </CardContent>
        </Card>
      )}

      {/* User Details Dialog */}
      <Dialog open={showUserDetails} onOpenChange={setShowUserDetails}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-primary" />
              <span>User Details - {selectedUser?.fullName}</span>
            </DialogTitle>
            <DialogDescription>
              View detailed betting history and account information
            </DialogDescription>
          </DialogHeader>

          {selectedUser && (
            <div className="space-y-6">
              {/* User Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4 text-center">
                    <DollarSign className="h-6 w-6 text-primary mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formatCurrency(selectedUser.walletBalance)}</div>
                    <div className="text-sm text-muted-foreground">Wallet Balance</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingUp className="h-6 w-6 text-success mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formatCurrency(selectedUser.totalWinnings)}</div>
                    <div className="text-sm text-muted-foreground">Total Winnings</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <TrendingDown className="h-6 w-6 text-destructive mx-auto mb-2" />
                    <div className="text-2xl font-bold">{formatCurrency(selectedUser.totalLosses)}</div>
                    <div className="text-sm text-muted-foreground">Total Losses</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <Calendar className="h-6 w-6 text-blue-600 mx-auto mb-2" />
                    <div className="text-2xl font-bold">{selectedUser.totalBets}</div>
                    <div className="text-sm text-muted-foreground">Total Bets</div>
                  </CardContent>
                </Card>
              </div>

              {/* Betting History */}
              <div>
                <h3 className="text-lg font-semibold mb-4">Betting History</h3>
                <div className="space-y-3">
                  {userBets.map((bet) => (
                    <Card key={bet.id} className="shadow-sm">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium">
                              {bet.gameDetails.homeTeam} vs {bet.gameDetails.awayTeam}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {bet.gameDetails.league} • {formatDate(bet.placedAt)}
                            </div>
                            <div className="text-xs text-muted-foreground mt-1">
                              Bet: {bet.betOn.replace('_', ' ').toUpperCase()} • 
                              Stake: {formatCurrency(bet.stake)} • 
                              Odds: {bet.odds}
                            </div>
                          </div>
                          
                          <div className="text-right">
                            <div className={`font-semibold ${
                              bet.status === 'won' ? 'text-success' : 
                              bet.status === 'lost' ? 'text-destructive' : 
                              'text-muted-foreground'
                            }`}>
                              {bet.status.toUpperCase()}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCurrency(bet.potentialWinnings)}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                {userBets.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    No betting history found for this user.
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}; 