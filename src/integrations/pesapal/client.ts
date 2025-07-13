// PesaPal Payment Integration
// This file handles PesaPal API integration for deposits and subscriptions

export interface PesaPalConfig {
  consumerKey: string;
  consumerSecret: string;
  businessShortCode: string;
  passkey: string;
  environment: 'sandbox' | 'live';
}

export interface PaymentRequest {
  amount: number;
  phoneNumber: string;
  reference: string;
  description: string;
  callbackUrl: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  checkoutUrl?: string;
  error?: string;
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'completed' | 'failed';
  amount: number;
  phoneNumber: string;
  timestamp: string;
}

class PesaPalClient {
  private config: PesaPalConfig;
  private baseUrl: string;

  constructor(config: PesaPalConfig) {
    this.config = config;
    this.baseUrl = config.environment === 'live' 
      ? 'https://api.pesapal.com' 
      : 'https://api.pesapal.com/sandbox';
  }

  private async getAccessToken(): Promise<string> {
    try {
      console.log('Attempting to get PesaPal access token from:', `${this.baseUrl}/api/Auth/RequestToken`);
      console.log('Using credentials:', {
        consumer_key: this.config.consumerKey,
        consumer_secret: this.config.consumerSecret ? '***SET***' : '***NOT SET***'
      });

      const response = await fetch(`${this.baseUrl}/api/Auth/RequestToken`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          consumer_key: this.config.consumerKey,
          consumer_secret: this.config.consumerSecret,
        }),
      });

      console.log('PesaPal auth response status:', response.status);
      console.log('PesaPal auth response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('PesaPal auth error response:', errorText);
        throw new Error(`Failed to get access token: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('PesaPal auth success, token received');
      return data.token;
    } catch (error) {
      console.error('Error getting PesaPal access token:', error);
      throw error;
    }
  }

  async initiatePayment(payment: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log('Initiating PesaPal payment with payload:', payment);
      
      const token = await this.getAccessToken();
      console.log('Got access token, proceeding with payment request');

      const payload = {
        id: payment.reference,
        currency: 'KES',
        amount: payment.amount,
        description: payment.description,
        callback_url: payment.callbackUrl,
        notification_id: payment.reference,
        billing_address: {
          email_address: 'user@betwise.com',
          phone_number: payment.phoneNumber,
          country_code: 'KE',
          first_name: 'BetWise',
          last_name: 'User',
        },
      };

      console.log('Payment payload:', payload);
      console.log('Making request to:', `${this.baseUrl}/api/Transactions/SubmitOrderRequest`);

      const response = await fetch(`${this.baseUrl}/api/Transactions/SubmitOrderRequest`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      console.log('Payment response status:', response.status);
      console.log('Payment response headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Payment initiation error response:', errorText);
        throw new Error(`Failed to initiate payment: ${response.status} ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Payment initiation success, data:', data);
      
      return {
        success: true,
        transactionId: data.order_tracking_id,
        checkoutUrl: data.redirect_url,
      };
    } catch (error) {
      console.error('Error initiating PesaPal payment:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment initiation failed',
      };
    }
  }

  async checkPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    try {
      const token = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/api/Transactions/GetTransactionStatus?orderTrackingId=${transactionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to check payment status');
      }

      const data = await response.json();
      
      return {
        transactionId: data.order_tracking_id,
        status: this.mapPesaPalStatus(data.payment_status_description),
        amount: data.amount,
        phoneNumber: data.phone_number,
        timestamp: data.created_date,
      };
    } catch (error) {
      console.error('Error checking PesaPal payment status:', error);
      throw error;
    }
  }

  private mapPesaPalStatus(pesaPalStatus: string): 'pending' | 'completed' | 'failed' {
    const statusMap: Record<string, 'pending' | 'completed' | 'failed'> = {
      'COMPLETED': 'completed',
      'PENDING': 'pending',
      'FAILED': 'failed',
      'CANCELLED': 'failed',
    };
    
    return statusMap[pesaPalStatus] || 'pending';
  }

  // Simulate PesaPal payment for development/testing
  async simulatePayment(payment: PaymentRequest): Promise<PaymentResponse> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate a unique transaction ID
    const transactionId = `TXN_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // Create a simulated checkout URL that will redirect back to our callback
    const simulatedCheckoutUrl = `${window.location.origin}/payment/simulate?transaction_id=${transactionId}&reference=${payment.reference}&payment_status=completed`;

    // Simulate success response
    return {
      success: true,
      transactionId,
      checkoutUrl: simulatedCheckoutUrl,
    };
  }

  async simulatePaymentStatus(transactionId: string): Promise<PaymentStatus> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Simulate completed payment
    return {
      transactionId,
      status: 'completed',
      amount: 500, // Default amount
      phoneNumber: '254700000000',
      timestamp: new Date().toISOString(),
    };
  }
}

// Initialize PesaPal client with environment variables
const pesaPalConfig: PesaPalConfig = {
  consumerKey: (import.meta as any).env?.VITE_PESAPAL_CONSUMER_KEY || 'your_consumer_key',
  consumerSecret: (import.meta as any).env?.VITE_PESAPAL_CONSUMER_SECRET || 'your_consumer_secret',
  businessShortCode: (import.meta as any).env?.VITE_PESAPAL_BUSINESS_SHORTCODE || 'your_shortcode',
  passkey: (import.meta as any).env?.VITE_PESAPAL_PASSKEY || 'your_passkey',
  environment: ((import.meta as any).env?.VITE_PESAPAL_ENVIRONMENT as 'sandbox' | 'live') || 'sandbox',
};

export const pesaPalClient = new PesaPalClient(pesaPalConfig); 