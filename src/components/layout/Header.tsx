import React from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { LogOut, User, Settings } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-card border-b border-border shadow-sm">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-primary">⚽ BetWise</h1>
            <span className="text-sm text-muted-foreground hidden sm:block">
              Football Betting Platform
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <User className="h-4 w-4 text-muted-foreground" />
              <span className="font-medium">{user?.fullName}</span>
            </div>

            {user?.isAdmin && (
              <div className="flex items-center space-x-1 bg-primary/10 px-2 py-1 rounded-md">
                <Settings className="h-3 w-3 text-primary" />
                <span className="text-xs font-medium text-primary">Admin</span>
              </div>
            )}

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-muted-foreground hover:text-foreground"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};