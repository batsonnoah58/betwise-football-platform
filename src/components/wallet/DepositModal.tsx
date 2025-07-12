import React, { useState } from 'react';
import { useAuth } from '../AuthGuard';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { CreditCard, Smartphone, DollarSign } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

interface DepositModalProps {
  onClose: () => void;
}

export const DepositModal: React.FC<DepositModalProps> = ({ onClose }) => {
  const [amount, setAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'mpesa' | 'card'>('mpesa');
  const [isProcessing, setIsProcessing] = useState(false);
  const { updateWallet } = useAuth();

  const handleDeposit = async () => {
    const depositAmount = parseFloat(amount);
    
    if (isNaN(depositAmount) || depositAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount greater than 0",
        variant: "destructive",
      });
      return;
    }

    if (depositAmount < 100) {
      toast({
        title: "Minimum Deposit",
        description: "Minimum deposit amount is KES 100",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      updateWallet(depositAmount);
      toast({
        title: "Deposit Successful",
        description: `KES ${depositAmount.toLocaleString()} has been added to your wallet`,
        variant: "default",
      });
      setIsProcessing(false);
      onClose();
    }, 2000);
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <span>Deposit Funds</span>
          </DialogTitle>
          <DialogDescription>
            Add money to your BetWise wallet to start betting
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="amount">Deposit Amount (KES)</Label>
            <Input
              id="amount"
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min="100"
              max="100000"
            />
            {amount && (
              <div className="text-sm text-muted-foreground">
                Amount: {formatCurrency(amount)}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod('mpesa')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'mpesa'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <Smartphone className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">M-Pesa</div>
              </button>
              
              <button
                type="button"
                onClick={() => setPaymentMethod('card')}
                className={`p-4 border-2 rounded-lg transition-all ${
                  paymentMethod === 'card'
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
              >
                <CreditCard className="h-6 w-6 mx-auto mb-2 text-primary" />
                <div className="text-sm font-medium">Card</div>
              </button>
            </div>
          </div>

          <div className="bg-muted/50 p-4 rounded-lg">
            <div className="text-sm text-muted-foreground mb-2">Quick amounts:</div>
            <div className="grid grid-cols-3 gap-2">
              {[500, 1000, 2000].map((quickAmount) => (
                <Button
                  key={quickAmount}
                  variant="outline"
                  size="sm"
                  onClick={() => setAmount(quickAmount.toString())}
                  className="text-xs"
                >
                  KES {quickAmount}
                </Button>
              ))}
            </div>
          </div>

          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button
              onClick={handleDeposit}
              disabled={!amount || isProcessing}
              className="flex-1"
              variant="gradient"
            >
              {isProcessing ? 'Processing...' : `Deposit ${amount ? formatCurrency(amount) : ''}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};