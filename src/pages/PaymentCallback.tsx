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
        // For PayPal, the order ID is returned as 'token' in the query params
        const orderId = searchParams.get('token');
        const reference = searchParams.get('reference');

        if (!orderId || !reference) {
          setStatus('failed');
          setMessage('Invalid payment callback parameters. Please try again.');
          toast.error('Invalid payment callback parameters.');
          return;
        }

        if (!user) {
          setStatus('failed');
          setMessage('User not found. Please log in.');
          toast.error('User not found. Please log in.');
          return;
        }

        // Call PayPal capture endpoint
        const captureRes = await fetch('/api/paypal-capture', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        });
        const captureData = await captureRes.json();
        if (!captureRes.ok) {
          setStatus('failed');
          setMessage('Payment capture failed. Please contact support.');
          toast.error('Payment capture failed.');
          return;
        }

        // Update transaction status in your DB
        await fetch('/api/update-transaction-status', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ reference, status: 'completed' })
        });

        setStatus('success');
        setMessage('Payment successful!');
      } catch (error) {
        setStatus('failed');
        setMessage('Payment processing failed.');
        toast.error('Payment processing failed.');
      }
    };
    handlePaymentCallback();
  }, [searchParams, user]);

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