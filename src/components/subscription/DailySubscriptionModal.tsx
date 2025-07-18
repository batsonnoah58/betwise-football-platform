import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CheckCircle, Clock, Star, Zap, ExternalLink } from 'lucide-react';
import { PaymentService } from '../../services/paymentService';
import { formatPhoneNumber, validatePhoneNumber, getPhoneNumberError, phoneNumberExamples } from '../../utils/phoneNumber';
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

    const phoneError = getPhoneNumberError(phoneNumber);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone number:', formattedPhone);

    setIsProcessing(true);

    try {
      const response = await PaymentService.initiateSubscription(
        user.id,
        formattedPhone
      );

      if (response.success && response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        toast.success("Subscription initiated! Redirecting to PayPal...");
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
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="text-center text-xl sm:text-2xl font-bold text-primary">
            🏆 Daily Sure Odds Access
          </DialogTitle>
          <DialogDescription className="text-center text-sm">
            Unlock today's premium betting tips and odds
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="text-center">
            <div className="text-3xl sm:text-4xl font-bold text-primary mb-2">KES 500</div>
            <div className="text-sm sm:text-base text-muted-foreground">Per Day Access</div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-primary/5 rounded-lg">
                <feature.icon className="h-4 w-4 sm:h-5 sm:w-5 text-primary flex-shrink-0" />
                <span className="text-xs sm:text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </div>

          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-3 sm:p-4 rounded-lg border border-primary/20">
            <div className="text-center">
              <div className="font-semibold text-primary mb-1 text-sm sm:text-base">Today's Special</div>
              <div className="text-xs sm:text-sm text-muted-foreground">
                5+ High-confidence matches with detailed analysis
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <input
              type="tel"
              placeholder="0700000000 or 254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="w-full px-3 py-2 border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-sm sm:text-base"
            />
            <div className="text-xs text-muted-foreground">
              Enter your M-Pesa registered phone number (any format accepted)
            </div>
            <div className="text-xs text-muted-foreground">
              Examples: 0700000000, 700000000, 254700000000
            </div>
          </div>

          {checkoutUrl ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="text-green-800 text-xs sm:text-sm">
                  Subscription initiated successfully! Click the button below to complete your payment on PayPal.
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                <Button variant="outline" onClick={onClose} className="flex-1 text-sm sm:text-base">
                  Close
                </Button>
                <Button
                  onClick={handleCheckoutRedirect}
                  className="flex-1 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  variant="gradient"
                >
                  <ExternalLink className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                  Complete Payment
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
              <Button variant="outline" onClick={onClose} className="flex-1 text-sm sm:text-base">
                Maybe Later
              </Button>
              <Button
                onClick={handlePayment}
                disabled={!user || !phoneNumber || isProcessing}
                className="flex-1 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
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