import { pesaPalClient, PaymentRequest, PaymentResponse, PaymentStatus } from '../integrations/pesapal/client';
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
  ): Promise<PaymentResponse> {
    try {
      console.log('Initiating deposit with:', { userId, amount, phoneNumber });
      
      const reference = `DEP_${userId}_${Date.now()}`;
      
      const paymentRequest: PaymentRequest = {
        amount,
        phoneNumber,
        reference,
        description: `Wallet deposit of KES ${amount.toLocaleString()}`,
        callbackUrl: `${window.location.origin}/payment/callback`,
      };

      console.log('Payment request:', paymentRequest);

      // Call Netlify Function instead of direct PesaPal API
      const response = await fetch(
        'https://bet-wise.netlify.app/.netlify/functions/pesapal-initiate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequest),
        }
      );
      const data = await response.json();
      console.log('Netlify Function payment response:', data);

      if (data.success && data.transactionId) {
        // Store transaction in database
        await supabase
          .from('payment_transactions')
          .insert({
            id: reference,
            user_id: userId,
            type: 'deposit',
            amount,
            status: 'pending',
            transaction_id: data.transactionId,
            phone_number: phoneNumber,
            description: paymentRequest.description,
          });

        return data;
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Error initiating deposit:', error);
      toast.error('Failed to initiate payment. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  static async initiateSubscription(
    userId: string, 
    phoneNumber: string
  ): Promise<PaymentResponse> {
    try {
      console.log('Initiating subscription with:', { userId, phoneNumber });
      
      const reference = `SUB_${userId}_${Date.now()}`;
      
      const paymentRequest: PaymentRequest = {
        amount: 500, // Daily subscription fee
        phoneNumber,
        reference,
        description: 'Daily subscription for BetWise sure odds access',
        callbackUrl: `${window.location.origin}/payment/callback`,
      };

      console.log('Subscription request:', paymentRequest);

      // Call Netlify Function instead of direct PesaPal API
      const response = await fetch(
        'https://bet-wise.netlify.app/.netlify/functions/pesapal-initiate',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(paymentRequest),
        }
      );
      const data = await response.json();
      console.log('Netlify Function subscription response:', data);

      if (data.success && data.transactionId) {
        // Store transaction in database
        await supabase
          .from('payment_transactions')
          .insert({
            id: reference,
            user_id: userId,
            type: 'subscription',
            amount: 500,
            status: 'pending',
            transaction_id: data.transactionId,
            phone_number: phoneNumber,
            description: paymentRequest.description,
          });

        return data;
      } else {
        throw new Error(data.error || 'Payment initiation failed');
      }
    } catch (error) {
      console.error('Error initiating subscription:', error);
      toast.error('Failed to initiate subscription payment. Please try again.');
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  static async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const isDevelopment = (import.meta as any).env?.VITE_MODE === 'development';
      const status = isDevelopment 
        ? await pesaPalClient.simulatePaymentStatus(transactionId)
        : await pesaPalClient.checkPaymentStatus(transactionId);

      return status;
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }

  static async processPaymentSuccess(
    transactionId: string, 
    userId: string, 
    type: 'deposit' | 'subscription'
  ): Promise<void> {
    try {
      // Update transaction status
      await supabase
        .from('payment_transactions')
        .update({ status: 'completed' })
        .eq('transaction_id', transactionId);

      if (type === 'deposit') {
        // Get transaction amount
        const { data: transaction } = await supabase
          .from('payment_transactions')
          .select('amount')
          .eq('transaction_id', transactionId)
          .single();

        if (transaction) {
          // Update user wallet
          const { data: currentProfile } = await supabase
            .from('profiles')
            .select('wallet_balance')
            .eq('id', userId)
            .single();

          if (currentProfile) {
            const newBalance = Number(currentProfile.wallet_balance) + transaction.amount;
            await supabase
              .from('profiles')
              .update({ wallet_balance: newBalance })
              .eq('id', userId);

            // Add transaction record
            await supabase
              .from('transactions')
              .insert({
                user_id: userId,
                type: 'deposit',
                amount: transaction.amount,
                description: 'Wallet deposit via PesaPal',
              });
          }
        }
      } else if (type === 'subscription') {
        // Grant daily access
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        await supabase
          .from('profiles')
          .update({ 
            daily_access_granted_until: tomorrow.toISOString(),
          })
          .eq('id', userId);

        // Add transaction record
        await supabase
          .from('transactions')
          .insert({
            user_id: userId,
            type: 'subscription',
            amount: 500,
            description: 'Daily subscription payment via PesaPal',
          });
      }

      toast.success(type === 'deposit' 
        ? 'Deposit successful! Your wallet has been credited.' 
        : 'Subscription successful! You now have access to today\'s odds.'
      );
    } catch (error) {
      console.error('Error processing payment success:', error);
      toast.error('Error processing payment. Please contact support.');
    }
  }

  static async getUserTransactions(userId: string): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transaction => ({
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        transactionId: transaction.transaction_id,
        phoneNumber: transaction.phone_number,
        description: transaction.description,
        createdAt: transaction.created_at,
      }));
    } catch (error) {
      console.error('Error fetching user transactions:', error);
      return [];
    }
  }

  static async getPendingTransactions(): Promise<PaymentTransaction[]> {
    try {
      const { data, error } = await supabase
        .from('payment_transactions')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;

      return (data || []).map(transaction => ({
        id: transaction.id,
        userId: transaction.user_id,
        type: transaction.type,
        amount: transaction.amount,
        status: transaction.status,
        transactionId: transaction.transaction_id,
        phoneNumber: transaction.phone_number,
        description: transaction.description,
        createdAt: transaction.created_at,
      }));
    } catch (error) {
      console.error('Error fetching pending transactions:', error);
      return [];
    }
  }
} 