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
        const transactionId = searchParams.get('OrderTrackingId');
        const reference = searchParams.get('OrderMerchantReference');

        if (!transactionId || !reference) {
          setStatus('failed');
          setMessage('Invalid payment callback parameters. Please try again.');
          toast.error('Invalid payment callback parameters.');
          return;
        }

        if (!user) {
          // Wait for user to be available
          return;
        }

        // Check payment status with PesaPal
        const paymentStatusResult = await PaymentService.checkPaymentStatus(transactionId);

        if (paymentStatusResult.status === 'completed') {
          const isSubscription = reference.startsWith('SUB_');
          const transactionType = isSubscription ? 'subscription' : 'deposit';
          await PaymentService.processPaymentSuccess(transactionId, user.id, transactionType);
          setStatus('success');
        } else if (paymentStatusResult.status === 'failed') {
          setStatus('failed');
          setMessage('Payment failed or was cancelled. Please try again.');
        } else {
          // Pending
          setStatus('failed'); // Or a new 'pending' state
          setMessage('Payment is still pending. We will update your account once it is confirmed.');
        }
      } catch (error) {
        console.error('Payment callback error:', error);
        setStatus('failed');
        setMessage('An unexpected error occurred. Please contact support if the issue persists.');
        toast.error('Error processing payment callback.');
      }
    };

    handlePaymentCallback();
  }, [searchParams, user, navigate]);

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
                  Your payment has been processed successfully.
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
                  Payment Update
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