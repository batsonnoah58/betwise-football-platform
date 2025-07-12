# PesaPal Payment Integration Setup

This guide explains how to set up PesaPal payment integration for the BetWise Football platform.

## Prerequisites

1. PesaPal Business Account
2. API credentials from PesaPal
3. Supabase database setup

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# PesaPal Configuration
VITE_PESAPAL_CONSUMER_KEY=your_pesapal_consumer_key
VITE_PESAPAL_CONSUMER_SECRET=your_pesapal_consumer_secret
VITE_PESAPAL_BUSINESS_SHORTCODE=your_pesapal_business_shortcode
VITE_PESAPAL_PASSKEY=your_pesapal_passkey
VITE_PESAPAL_ENVIRONMENT=sandbox

# Development Mode
VITE_MODE=development
```

## PesaPal API Credentials

1. **Consumer Key**: Your PesaPal API consumer key
2. **Consumer Secret**: Your PesaPal API consumer secret
3. **Business Shortcode**: Your PesaPal business shortcode
4. **Passkey**: Your PesaPal API passkey
5. **Environment**: Use `sandbox` for testing, `live` for production

## Database Setup

Run the following migration to create the payment_transactions table:

```sql
-- Create payment_transactions table
CREATE TABLE IF NOT EXISTS payment_transactions (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'subscription')),
  amount DECIMAL(10,2) NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('pending', 'completed', 'failed')),
  transaction_id TEXT,
  phone_number TEXT NOT NULL,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_payment_transactions_user_id ON payment_transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_status ON payment_transactions(status);
CREATE INDEX IF NOT EXISTS idx_payment_transactions_transaction_id ON payment_transactions(transaction_id);

-- Enable RLS
ALTER TABLE payment_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies
CREATE POLICY "Users can view their own payment transactions" ON payment_transactions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own payment transactions" ON payment_transactions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all payment transactions" ON payment_transactions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update payment transactions" ON payment_transactions
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );
```

## Features Implemented

### 1. Payment Integration
- **PesaPal Client**: Handles API authentication and payment requests
- **Payment Service**: Manages payment operations and database transactions
- **Simulation Mode**: For development/testing without real API calls

### 2. User Features
- **Deposit Modal**: Users can deposit funds via M-Pesa
- **Subscription Modal**: Users can pay for daily access
- **Payment Callback**: Handles payment status updates

### 3. Admin Features
- **Payment Transactions**: View and manage all payment transactions
- **Transaction Status**: Monitor pending, completed, and failed payments
- **Real-time Updates**: Refresh transaction status

### 4. Payment Flow

1. **Initiate Payment**:
   - User enters amount and phone number
   - System creates payment request to PesaPal
   - User is redirected to PesaPal checkout

2. **Payment Processing**:
   - PesaPal processes the payment
   - User receives SMS prompt
   - Payment status is updated

3. **Callback Handling**:
   - PesaPal redirects to callback URL
   - System verifies payment status
   - Wallet/subscription is updated accordingly

## Development vs Production

### Development Mode
- Uses simulated payment responses
- No real API calls to PesaPal
- Useful for testing UI and flow

### Production Mode
- Real PesaPal API integration
- Live payment processing
- Actual SMS prompts and transactions

## Testing

1. **Development Testing**:
   - Set `VITE_MODE=development`
   - Use simulated payment responses
   - Test UI flow without real payments

2. **Sandbox Testing**:
   - Set `VITE_PESAPAL_ENVIRONMENT=sandbox`
   - Use PesaPal sandbox credentials
   - Test with real API but no actual charges

3. **Production Testing**:
   - Set `VITE_PESAPAL_ENVIRONMENT=live`
   - Use production PesaPal credentials
   - Real payment processing

## Security Considerations

1. **Environment Variables**: Never commit API keys to version control
2. **RLS Policies**: Database access is restricted by user role
3. **Payment Verification**: Always verify payment status with PesaPal
4. **Error Handling**: Graceful handling of payment failures

## Troubleshooting

### Common Issues

1. **Payment Initiation Fails**:
   - Check API credentials
   - Verify environment variables
   - Ensure phone number format (254700000000)

2. **Callback Not Working**:
   - Check callback URL configuration
   - Verify route setup in React Router
   - Ensure proper error handling

3. **Database Errors**:
   - Run migration scripts
   - Check RLS policies
   - Verify table structure

### Debug Mode

Enable debug logging by adding to your environment:

```env
VITE_DEBUG=true
```

This will log detailed payment flow information to the console.

## Support

For PesaPal integration issues:
1. Check PesaPal API documentation
2. Verify credentials and environment settings
3. Test with sandbox environment first
4. Contact PesaPal support for API issues

For application issues:
1. Check browser console for errors
2. Verify database connection
3. Test payment flow step by step 