import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CheckCircle, Clock, Star, Zap } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface DailySubscriptionModalProps {
  onClose: () => void;
}

export const DailySubscriptionModal: React.FC<DailySubscriptionModalProps> = ({ onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { user, grantDailyAccess } = useAuth();

  const handlePayment = async () => {
    if (!user || user.walletBalance < 500) {
      toast({
        title: "Insufficient Funds",
        description: "You need at least KES 500 in your wallet to access today's odds. Please deposit funds first.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      grantDailyAccess();
      toast({
        title: "Access Granted!",
        description: "You now have access to today's sure odds until midnight",
        variant: "default",
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
  };

  const features = [
    { icon: Star, text: "Verified Sure Odds" },
    { icon: Zap, text: "Real-time Updates" },
    { icon: CheckCircle, text: "Expert Analysis" },
    { icon: Clock, text: "24-hour Access" },
  ];

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold text-primary">
            🏆 Daily Sure Odds Access
          </DialogTitle>
          <DialogDescription className="text-center">
            Unlock today's premium betting tips and odds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="text-center">
            <div className="text-4xl font-bold text-primary mb-2">KES 500</div>
            <div className="text-muted-foreground">Per Day Access</div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg">
                <feature.icon className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg border border-primary/20">
            <div className="text-center">
              <div className="font-semibold text-primary mb-1">Today's Special</div>
              <div className="text-sm text-muted-foreground">
                5+ High-confidence matches with detailed analysis
              </div>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm mb-2">
              <span className="font-medium">Wallet Balance:</span> KES {user?.walletBalance?.toLocaleString() || 0}
            </div>
            {user && user.walletBalance < 500 && (
              <div className="text-destructive text-sm">
                ⚠️ Insufficient balance. Please deposit at least KES 500 to continue.
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Maybe Later
            </Button>
            <Button
              onClick={handlePayment}
              disabled={!user || user.walletBalance < 500 || isProcessing}
              className="flex-1"
              variant="gradient"
            >
              {isProcessing ? 'Processing...' : 'Unlock for KES 500'}
            </Button>
          </div>

          <div className="text-xs text-center text-muted-foreground">
            Access expires at midnight. New payment required daily.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};