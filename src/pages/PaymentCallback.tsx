import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { PaymentService } from '../services/paymentService';
import { useAuth } from '../components/AuthGuard';
import { Button } from '../components/ui/button';
import { CheckCircle, XCircle, Loader2, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

export const PaymentCallback: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [status, setStatus] = useState<'loading' | 'success' | 'failed'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handlePaymentCallback = async () => {
      try {
        const transactionId = searchParams.get('transaction_id');
        const paymentStatus = searchParams.get('payment_status');
        const reference = searchParams.get('reference');

        if (!transactionId || !reference) {
          setStatus('failed');
          setMessage('Invalid payment callback parameters');
          return;
        }

        // Check payment status with PesaPal
        const paymentStatusResult = await PaymentService.checkPaymentStatus(transactionId);

        if (paymentStatusResult.status === 'completed') {
          // Determine transaction type from reference
          const isSubscription = reference.startsWith('SUB_');
          const transactionType = isSubscription ? 'subscription' : 'deposit';

          // Process successful payment
          await PaymentService.processPaymentSuccess(transactionId, user?.id || '', transactionType);

          setStatus('success');
          setMessage(
            transactionType === 'subscription' 
              ? 'Subscription successful! You now have access to today\'s odds.'
              : 'Deposit successful! Your wallet has been credited.'
          );
        } else if (paymentStatusResult.status === 'failed') {
          setStatus('failed');
          setMessage('Payment failed. Please try again.');
        } else {
          setStatus('failed');
          setMessage('Payment is still pending. Please check back later.');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('failed');
        setMessage('Error processing payment. Please contact support.');
      }
    };

    handlePaymentCallback();
  }, [searchParams, user?.id]);

  const handleGoToDashboard = () => {
    navigate('/dashboard');
  };

  const handleTryAgain = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-accent/5 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8">
        <div className="text-center space-y-6">
          {status === 'loading' && (
            <>
              <Loader2 className="h-16 w-16 text-primary animate-spin mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Processing Payment
                </h2>
                <p className="text-gray-600">
                  Please wait while we verify your payment...
                </p>
              </div>
            </>
          )}

          {status === 'success' && (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Successful!
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <Button
                  onClick={handleGoToDashboard}
                  className="w-full"
                  variant="gradient"
                >
                  Go to Dashboard
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <XCircle className="h-16 w-16 text-red-500 mx-auto" />
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Payment Failed
                </h2>
                <p className="text-gray-600 mb-6">
                  {message}
                </p>
                <div className="space-y-3">
                  <Button
                    onClick={handleTryAgain}
                    className="w-full"
                    variant="gradient"
                  >
                    Try Again
                  </Button>
                  <Button
                    onClick={handleGoToDashboard}
                    variant="outline"
                    className="w-full"
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" />
                    Back to Dashboard
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}; 