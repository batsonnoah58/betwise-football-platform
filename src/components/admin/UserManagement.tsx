import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Badge } from '../ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../ui/table';
import { RefreshCw, DollarSign, CreditCard, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  email: string;
  walletBalance: number;
  dailyAccessGrantedUntil: string | null;
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
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userBets, setUserBets] = useState<UserBet[]>([]);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  // Use React Query for data fetching with caching
  const { data: users, isLoading, refetch } = useQuery({
    queryKey: ['users'],
    queryFn: async () => {
             // Single optimized query to get all user data
       const { data: usersData, error: usersError } = await supabase
         .from('profiles')
         .select(`
           id,
           username,
           wallet_balance,
           daily_access_granted_until
         `)
         .order('id');

       if (usersError) throw usersError;

       // Get user roles and bets separately to avoid complex joins
       const { data: rolesData } = await supabase
         .from('user_roles')
         .select('user_id, role');

       const { data: betsData } = await supabase
         .from('bets')
         .select('user_id, stake, odds, status, potential_winnings');

       // Create lookup maps for better performance
       const rolesMap = new Map();
       rolesData?.forEach(role => {
         if (!rolesMap.has(role.user_id)) {
           rolesMap.set(role.user_id, []);
         }
         rolesMap.get(role.user_id).push(role.role);
       });

       const betsMap = new Map();
       betsData?.forEach(bet => {
         if (!betsMap.has(bet.user_id)) {
           betsMap.set(bet.user_id, []);
         }
         betsMap.get(bet.user_id).push(bet);
       });

      if (usersError) throw usersError;

             // Transform data in memory instead of multiple DB calls
       return usersData?.map(user => {
         const userRoles = rolesMap.get(user.id) || [];
         const isAdmin = userRoles.includes('admin');
         const userBets = betsMap.get(user.id) || [];
         
         const totalBets = userBets.length;
         const totalWinnings = userBets
           .filter((bet: any) => bet.status === 'won')
           .reduce((sum: number, bet: any) => sum + Number(bet.potential_winnings || 0), 0);
         const totalLosses = userBets
           .filter((bet: any) => bet.status === 'lost')
           .reduce((sum: number, bet: any) => sum + Number(bet.stake || 0), 0);

         return {
           id: user.id,
           fullName: user.username || 'Unknown User',
           email: '', // No email in profiles table
           walletBalance: Number(user.wallet_balance || 0),
           dailyAccessGrantedUntil: user.daily_access_granted_until,
           totalBets,
           totalWinnings,
           totalLosses,
           isAdmin
         };
       }) || [];
    },
    staleTime: 30000, // Cache for 30 seconds
    refetchOnWindowFocus: false
  });

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

  const filteredUsers = users?.filter(user =>
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  if (isLoading) {
    return (
      <div className="space-y-6">
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
    <div className="space-y-6">
      <Card className="shadow-betting">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl font-bold">User Management</CardTitle>
              <CardDescription>
                Manage user accounts, view betting history, and monitor activity
              </CardDescription>
            </div>
            <Button onClick={() => refetch()} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search users by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>User</TableHead>
                  <TableHead>Wallet Balance</TableHead>
                  <TableHead>Total Bets</TableHead>
                  <TableHead>Winnings</TableHead>
                  <TableHead>Losses</TableHead>
                  <TableHead>Access</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{formatCurrency(user.walletBalance)}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary">{user.totalBets}</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="text-green-600 font-medium">
                        {formatCurrency(user.totalWinnings)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-red-600 font-medium">
                        {formatCurrency(user.totalLosses)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {user.dailyAccessGrantedUntil ? (
                        <Badge variant="default" className="bg-green-500">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">No Access</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {user.isAdmin ? (
                        <Badge variant="destructive">Admin</Badge>
                      ) : (
                        <Badge variant="outline">User</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <Button
                        onClick={() => handleViewUserDetails(user)}
                        variant="outline"
                        size="sm"
                      >
                        View Details
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* User Details Dialog */}
      {showUserDetails && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">User Details: {selectedUser.fullName}</h2>
                <Button onClick={() => setShowUserDetails(false)} variant="outline">
                  Close
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <DollarSign className="h-5 w-5 mr-2" />
                      Wallet Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Current Balance:</span>
                        <span className="font-medium">{formatCurrency(selectedUser.walletBalance)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Winnings:</span>
                        <span className="font-medium text-green-600">{formatCurrency(selectedUser.totalWinnings)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Total Losses:</span>
                        <span className="font-medium text-red-600">{formatCurrency(selectedUser.totalLosses)}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <CreditCard className="h-5 w-5 mr-2" />
                      Betting Statistics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Total Bets:</span>
                        <span className="font-medium">{selectedUser.totalBets}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Daily Access:</span>
                        <span className="font-medium">
                          {selectedUser.dailyAccessGrantedUntil ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span>Role:</span>
                        <span className="font-medium">{selectedUser.isAdmin ? 'Admin' : 'User'}</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Betting History</CardTitle>
                </CardHeader>
                <CardContent>
                  {userBets.length > 0 ? (
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Stake</TableHead>
                            <TableHead>Odds</TableHead>
                            <TableHead>Potential Winnings</TableHead>
                            <TableHead>Status</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {userBets.map((bet) => (
                            <TableRow key={bet.id}>
                              <TableCell>{formatDate(bet.placedAt)}</TableCell>
                              <TableCell>{formatCurrency(bet.stake)}</TableCell>
                              <TableCell>{bet.odds}</TableCell>
                              <TableCell>{formatCurrency(bet.potentialWinnings)}</TableCell>
                              <TableCell>
                                <Badge
                                  variant={bet.status === 'won' ? 'default' : bet.status === 'lost' ? 'destructive' : 'secondary'}
                                >
                                  {bet.status}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      No betting history found for this user.
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}; 