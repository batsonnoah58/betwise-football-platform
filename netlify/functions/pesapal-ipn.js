const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use the service role key for write access
const supabase = createClient(supabaseUrl, supabaseKey);

exports.handler = async (event, context) => {
  if (event.httpMethod === "OPTIONS") {
    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: "ok",
    };
  }

  if (event.httpMethod !== "POST") {
    return {
      statusCode: 405,
      body: "Method Not Allowed",
    };
  }

  try {
    const body = JSON.parse(event.body);
    console.log("Received PesaPal IPN:", body);

    // Example: Extract transaction details
    const { transaction_id, status, amount, reference } = body;

    // Update payment_transactions table in Supabase
    const { error } = await supabase
      .from('payment_transactions')
      .update({ status: status ? status.toLowerCase() : 'completed' }) // e.g., 'completed', 'failed'
      .eq('transaction_id', transaction_id);

    if (error) {
      console.error("Supabase update error:", error);
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: error.message }),
      };
    }

    // Respond with 200 OK to acknowledge receipt
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.error("IPN handler error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
}; 