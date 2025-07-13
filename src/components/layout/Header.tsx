import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { LogOut, User, Settings, Menu, X, Wallet } from 'lucide-react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '../ui/sheet';
import { Badge } from '../ui/badge';

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <header className="bg-card/80 backdrop-blur-sm border-b border-border/50 shadow-sm sticky top-0 z-50 min-h-[64px]">
      <div className="container mx-auto px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between min-h-[48px]">
          {/* Logo and Brand */}
          <div className="flex items-center space-x-3 min-w-[40px]">
            <div className="flex items-center space-x-2">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-base sm:text-lg">
                ⚽
              </div>
              <div className="hidden sm:block">
                <h1 className="text-xl font-bold text-primary">BetWise</h1>
                <span className="text-xs text-muted-foreground">Football Betting</span>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2 bg-muted/50 px-3 py-1.5 rounded-full">
                <User className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium text-foreground">{user?.fullName}</span>
              </div>

              <div className="flex items-center space-x-2 bg-primary/10 px-3 py-1.5 rounded-full">
                <Wallet className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium text-primary">
                  {formatCurrency(user?.walletBalance || 0)}
                </span>
              </div>

              {user?.isAdmin && (
                <Badge variant="secondary" className="bg-primary/10 text-primary border-primary/20">
                  <Settings className="h-3 w-3 mr-1" />
                  Admin
                </Badge>
              )}
            </div>

            <Button 
              variant="ghost" 
              size="sm" 
              onClick={logout}
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50"
            >
              <LogOut className="h-4 w-4" />
              <span className="ml-2">Logout</span>
            </Button>
          </div>

          {/* Mobile Menu Trigger */}
          <div className="md:hidden">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="p-2 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2" aria-label="Open mobile menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[280px] sm:w-[350px]">
                <SheetHeader>
                  <SheetTitle className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-gradient-primary rounded flex items-center justify-center text-white text-xs font-bold">
                      ⚽
                    </div>
                    <span>BetWise</span>
                  </SheetTitle>
                </SheetHeader>
                
                <div className="mt-6 space-y-4">
                  {/* User Info */}
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-muted/30 rounded-lg">
                      <div className="w-10 h-10 bg-gradient-primary rounded-full flex items-center justify-center text-white font-semibold">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="flex-1">
                        <div className="font-medium text-foreground">{user?.fullName}</div>
                        <div className="text-sm text-muted-foreground">{user?.email}</div>
                      </div>
                    </div>

                    {/* Wallet Balance */}
                    <div className="p-3 bg-primary/5 rounded-lg border border-primary/10">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Wallet className="h-4 w-4 text-primary" />
                          <span className="text-sm font-medium">Wallet Balance</span>
                        </div>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(user?.walletBalance || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Admin Badge */}
                    {user?.isAdmin && (
                      <div className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg border border-primary/10">
                        <Settings className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium text-primary">Administrator</span>
                      </div>
                    )}
                  </div>

                  {/* Navigation Actions */}
                  <div className="space-y-2">
                    <Button 
                      variant="outline" 
                      className="w-full justify-start focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => {
                        // Add navigation logic here
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Profile Settings
                    </Button>
                    
                    <Button 
                      variant="outline" 
                      className="w-full justify-start focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => {
                        // Add navigation logic here
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <Wallet className="h-4 w-4 mr-2" />
                      Transaction History
                    </Button>
                  </div>

                  {/* Logout Button */}
                  <div className="pt-4 border-t border-border">
                    <Button 
                      variant="destructive" 
                      className="w-full justify-start focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Logout
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  );
};