import React, { useState, useEffect } from 'react';
import { Header } from '../layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Settings, Users, Trophy, DollarSign, Calendar, BarChart3, Plus, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { GameManagement } from './GameManagement';
import { TeamManagement } from './TeamManagement';
import { LeagueManagement } from './LeagueManagement';
import { UserManagement } from './UserManagement';
import { ResultManagement } from './ResultManagement';
import { PaymentTransactions } from './PaymentTransactions';

interface AdminStats {
  totalUsers: number;
  activeGames: number;
  dailyRevenue: number;
  totalBetsToday: number;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'games' | 'teams' | 'leagues' | 'users' | 'results' | 'payments'>('overview');
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    activeGames: 0,
    dailyRevenue: 0,
    totalBetsToday: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats();
  }, []);

  const fetchAdminStats = async () => {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Fetch total users
      const { count: userCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      // Fetch active games
      const { count: gameCount } = await supabase
        .from('games')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'upcoming');

      // Fetch today's revenue (subscription payments)
      const { data: todayTransactions } = await supabase
        .from('transactions')
        .select('amount')
        .eq('type', 'subscription')
        .gte('created_at', today.toISOString());

      const dailyRevenue = todayTransactions?.reduce((sum, t) => sum + Number(t.amount), 0) || 0;

      // Fetch today's bets
      const { count: betCount } = await supabase
        .from('bets')
        .select('*', { count: 'exact', head: true })
        .gte('placed_at', today.toISOString());

      setStats({
        totalUsers: userCount || 0,
        activeGames: gameCount || 0,
        dailyRevenue,
        totalBetsToday: betCount || 0
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'games', label: 'Games', icon: Trophy },
    { id: 'teams', label: 'Teams', icon: Users },
    { id: 'leagues', label: 'Leagues', icon: Calendar },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'results', label: 'Results', icon: CheckCircle },
    { id: 'payments', label: 'Payments', icon: DollarSign }
  ];

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
        <Header />
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-primary/5">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-primary flex items-center space-x-2">
              <Settings className="h-6 w-6 sm:h-8 sm:w-8" />
              <span>Admin Dashboard</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">Manage your BetWise platform</p>
          </div>
          <Badge variant="default" className="bg-gradient-primary w-fit">
            Administrator
          </Badge>
        </div>

        {/* Tab Navigation */}
        <div className="flex flex-wrap gap-1 mb-6 bg-muted/50 p-1 rounded-lg w-full sm:w-fit overflow-x-auto">
          {tabs.map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id as any)}
              className="flex items-center space-x-2 whitespace-nowrap focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
            >
              <tab.icon className="h-4 w-4" />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className="sm:hidden">{tab.label.charAt(0)}</span>
            </Button>
          ))}
        </div>

        {activeTab === 'overview' && (
          <div className="space-y-6 animate-fade-in">
            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
              <Card className="shadow-betting">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Total Users</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{stats.totalUsers.toLocaleString()}</p>
                      <p className="text-xs sm:text-sm text-success mt-1">+12% from last week</p>
                    </div>
                    <Users className="h-6 w-6 sm:h-8 sm:w-8 text-blue-600 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-betting">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Active Games</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{stats.activeGames}</p>
                      <p className="text-xs sm:text-sm text-success mt-1">+3 new today</p>
                    </div>
                    <Trophy className="h-6 w-6 sm:h-8 sm:w-8 text-green-600 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-betting">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Daily Revenue</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{formatCurrency(stats.dailyRevenue)}</p>
                      <p className="text-xs sm:text-sm text-success mt-1">+8% from yesterday</p>
                    </div>
                    <DollarSign className="h-6 w-6 sm:h-8 sm:w-8 text-primary flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-betting">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-medium text-muted-foreground">Today's Bets</p>
                      <p className="text-xl sm:text-2xl font-bold mt-1 truncate">{stats.totalBetsToday}</p>
                      <p className="text-xs sm:text-sm text-success mt-1">+15% from yesterday</p>
                    </div>
                    <BarChart3 className="h-6 w-6 sm:h-8 sm:w-8 text-purple-600 flex-shrink-0 ml-2" />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card className="shadow-betting">
              <CardHeader className="px-4 sm:px-6">
                <CardTitle className="flex items-center space-x-2 text-base sm:text-lg">
                  <Plus className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
                  <span>Quick Actions</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="px-4 sm:px-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => setActiveTab('games')}
                  >
                    <Plus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                    <span className="text-xs sm:text-sm">Add New Game</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                    onClick={() => setActiveTab('results')}
                  >
                    <CheckCircle className="h-5 w-5 sm:h-6 sm:w-6 text-success" />
                    <span className="text-xs sm:text-sm">Update Results</span>
                  </Button>
                  
                  <Button 
                    variant="outline" 
                    className="h-16 sm:h-20 flex flex-col items-center justify-center space-y-1 sm:space-y-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 sm:col-span-2 lg:col-span-1"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                    <span className="text-xs sm:text-sm">Manage Users</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'games' && <GameManagement />}
        {activeTab === 'teams' && <TeamManagement />}
        {activeTab === 'leagues' && <LeagueManagement />}
        {activeTab === 'users' && <UserManagement />}
        {activeTab === 'results' && <ResultManagement />}
        {activeTab === 'payments' && <PaymentTransactions />}
      </div>
    </div>
  );
};