import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';

export const PaymentSimulate: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const simulatePayment = async () => {
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, 3000));

      // Get parameters from URL
      const transactionId = searchParams.get('transaction_id');
      const reference = searchParams.get('reference');
      const paymentStatus = searchParams.get('payment_status');

      // Redirect to the actual callback page with the same parameters
      const callbackUrl = `/payment/callback?transaction_id=${transactionId}&reference=${reference}&payment_status=${paymentStatus}`;
      navigate(callbackUrl);
    };

    simulatePayment();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-6">
          <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Simulating Payment
            </h2>
            <p className="text-gray-600">
              Processing your payment simulation...
            </p>
            <div className="mt-4 text-sm text-muted-foreground">
              This is a development simulation. In production, you would be redirected to PesaPal.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}; 