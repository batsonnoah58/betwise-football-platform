import { supabase } from '../integrations/supabase/client';
import { toast } from 'sonner';

export interface PaymentTransaction {
  id: string;
  userId: string;
  type: 'deposit' | 'subscription';
  amount: number;
  status: 'pending' | 'completed' | 'failed';
  transactionId?: string;
  phoneNumber: string;
  description: string;
  createdAt: string;
}

export class PaymentService {
  static async initiateDeposit(
    userId: string, 
    amount: number, 
    phoneNumber: string
  ): Promise<any> {
    try {
      const reference = `DEP_${userId}_${Date.now()}`;
      const paymentRequest = {
        amount: amount.toFixed(2),
        currency: 'USD', // or 'KES' if your PayPal account supports it
        return_url: `${window.location.origin}/payment/success?reference=${reference}`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      };
      const response = await fetch('/api/paypal-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest),
      });
      const data = await response.json();
      if (data.approvalLink) {
        // Store transaction in database
        await supabase
          .from('payment_transactions')
          .insert({
            id: reference,
            user_id: userId,
            type: 'deposit',
            amount,
            status: 'pending',
            transaction_id: data.id,
            phone_number: phoneNumber,
            description: `Wallet deposit of USD ${amount}`,
          });
        return { success: true, checkoutUrl: data.approvalLink };
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      toast.error('Failed to initiate payment. Please try again.');
      return { error: error instanceof Error ? error.message : 'Payment failed' };
    }
  }

  static async initiateSubscription(
    userId: string, 
    phoneNumber: string
  ): Promise<any> {
    try {
      const reference = `SUB_${userId}_${Date.now()}`;
      const paymentRequest = {
        amount: '5.00', // Example subscription fee in USD
        currency: 'USD',
        return_url: `${window.location.origin}/payment/success?reference=${reference}`,
        cancel_url: `${window.location.origin}/payment/cancel`,
      };
      const response = await fetch('/api/paypal-initiate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentRequest),
      });
      const data = await response.json();
      if (data.approvalLink) {
        // Store transaction in database
        await supabase
          .from('payment_transactions')
          .insert({
            id: reference,
            user_id: userId,
            type: 'subscription',
            amount: 5.00,
            status: 'pending',
            transaction_id: data.id,
            phone_number: phoneNumber,
            description: 'Daily subscription for BetWise sure odds access',
          });
        return { success: true, checkoutUrl: data.approvalLink };
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      toast.error('Failed to initiate subscription payment. Please try again.');
      return { success: false, error: error instanceof Error ? error.message : 'Payment failed' };
    }
  }

  // The rest of the methods (checkPaymentStatus, processPaymentSuccess) should be updated to use PayPal if needed.
} 