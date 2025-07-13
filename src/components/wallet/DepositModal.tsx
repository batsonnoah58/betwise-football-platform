import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreditCard, Smartphone, DollarSign, ExternalLink } from 'lucide-react';
import { PaymentService } from '../../services/paymentService';
import { formatPhoneNumber, getPhoneNumberError } from '../../utils/phoneNumber';
import { toast } from 'sonner';

interface DepositModalProps {
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutUrl, setCheckoutUrl] = useState<string | null>(null);
  const { user, updateWallet } = useAuth();

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (depositAmount < 100) {
      toast.error("Minimum deposit amount is KES 100");
      return;
    }

    const phoneError = getPhoneNumberError(phoneNumber);
    if (phoneError) {
      toast.error(phoneError);
      return;
    }

    const formattedPhone = formatPhoneNumber(phoneNumber);
    console.log('Formatted phone number:', formattedPhone);

    if (!user) {
      toast.error("Please log in to make a deposit");
      return;
    }

    setIsProcessing(true);

    try {
      const response = await PaymentService.initiateDeposit(
        user.id,
        depositAmount,
        formattedPhone
      );

      if (response.success && response.checkoutUrl) {
        setCheckoutUrl(response.checkoutUrl);
        toast.success("Payment initiated! Redirecting to PayPal...");
      } else {
        toast.error(response.error || "Failed to initiate payment");
      }
    } catch (error) {
      console.error('Payment error:', error);
      toast.error("Payment failed. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCheckoutRedirect = () => {
    if (checkoutUrl) {
      window.open(checkoutUrl, '_blank');
    }
  };

  const formatCurrency = (value: string) => {
    const num = parseFloat(value);
    if (isNaN(num)) return '';
    return new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      minimumFractionDigits: 0,
    }).format(num);
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader className="px-4 sm:px-6">
          <DialogTitle className="flex items-center space-x-2 text-base sm:text-lg">
            <DollarSign className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <span>Deposit Funds</span>
          </DialogTitle>
          <DialogDescription className="text-sm">
            Add money to your BetWise wallet to start betting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 px-4 sm:px-6">
          <div className="space-y-2">
            <Label htmlFor="amount" className="text-sm sm:text-base">Deposit Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max="100000"
              className="text-sm sm:text-base"
            />
            {amount && (
              <div className="text-xs sm:text-sm text-muted-foreground">
                Amount: {formatCurrency(amount)}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm sm:text-base">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="0700000000 or 254700000000"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              className="text-sm sm:text-base"
            />
            <div className="text-xs text-muted-foreground">
              Enter your M-Pesa registered phone number (any format accepted)
            </div>
            <div className="text-xs text-muted-foreground">
              Examples: 0700000000, 700000000, 254700000000
            </div>
          </div>

          <div className="space-y-3">
            <Label className="text-sm sm:text-base">Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  paymentMethod === 'mpesa'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Smartphone className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
                <div className="text-xs sm:text-sm font-medium">M-Pesa</div>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-3 sm:p-4 border-2 rounded-lg transition-all focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CreditCard className="h-5 w-5 sm:h-6 sm:w-6 mx-auto mb-2 text-primary" />
                <div className="text-xs sm:text-sm font-medium">Card</div>
              </button>
            </div>
          </div>

          <div className="bg-muted/50 p-3 sm:p-4 rounded-lg">
            <div className="text-xs sm:text-sm text-muted-foreground mb-2">Quick amounts:</div>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs sm:text-sm h-8 sm:h-9 focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  KES {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          {checkoutUrl ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 sm:p-4">
                <div className="text-green-800 text-xs sm:text-sm">
                  Payment initiated successfully! Click the button below to complete your payment on PayPal.
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
                Cancel
              </Button>
              <Button
                onClick={handleDeposit}
                disabled={!amount || !phoneNumber || isProcessing}
                className="flex-1 text-sm sm:text-base focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                variant="gradient"
              >
                {isProcessing ? 'Processing...' : `Deposit ${amount ? formatCurrency(amount) : ''}`}
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};