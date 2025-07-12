import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CheckCircle, Clock, Star, Zap, ExternalLink } from 'lucide-react';
import { PaymentService } from '../../services/paymentService';
import { toast } from 'sonner';

interface DailySubscriptionModalProps {
  onClose: () => void;
}

export const DailySubscriptionModal: React.FC<DailySubscriptionModalProps> = ({ onClose }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { user, grantDailyAccess } = useAuth();

  const handlePayment = async () => {
    if (!user) {
      toast.error("Please log in to subscribe");
      return;
    }

    if (!phoneNumber || phoneNumber.length < 10) {
      toast.error("Please enter a valid phone number");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await PaymentService.initiateSubscription(
        user.id,
        phoneNumber
      );

      if (response.success && response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        toast.success("Subscription initiated! Redirecting to PesaPal...");
      } else {
        toast.error(response.error || "Failed to initiate subscription");
      }
    } catch (error) {
      console.error('Subscription error:', error);
      toast.error("Subscription failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutRedirect = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
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

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
            />
            <div className="text-xs text-muted-foreground">
              Enter your M-Pesa registered phone number
            </div>
          </div>

          {checkoutUrl ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="text-green-800 text-sm">
                  Subscription initiated successfully! Click the button below to complete your payment on PesaPal.
                </div>
              </div>
              <div className="flex space-x-3">
                <Button variant="outline" onClick={onClose} className="flex-1">
                  Close
                </Button>
                <Button
                  onClick={handleCheckoutRedirect}
                  className="flex-1"
                  variant="gradient"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Complete Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex space-x-3">
              <Button variant="outline" onClick={onClose} className="flex-1">
                Maybe Later
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!user || !phoneNumber || isProcessing}
                className="flex-1"
                variant="gradient"
              >
                {isProcessing ? 'Processing...' : 'Unlock for KES 500'}
              </Button>
            </div>
          )}

          <div className="text-xs text-center text-muted-foreground">
            Access expires at midnight. New payment required daily.
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};