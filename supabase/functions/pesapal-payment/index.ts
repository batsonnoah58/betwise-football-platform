// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

console.log("Hello from Functions!")

const corsHeaders = {
  "Access-Control-Allow-Origin": "http://10.111.2.133:8080", // Set to your dev IP for local testing
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received request body:", body);

    const { amount, phoneNumber, reference, description, callbackUrl } = body;

    // Get secrets from environment variables
    const consumerKey = Deno.env.get("PESAPAL_CONSUMER_KEY");
    const consumerSecret = Deno.env.get("PESAPAL_CONSUMER_SECRET");
    const environment = Deno.env.get("PESAPAL_ENVIRONMENT") || "live";
    const baseUrl = environment === "live"
      ? "https://api.pesapal.com"
      : "https://api.pesapal.com/sandbox";

    if (!consumerKey || !consumerSecret) {
      console.error("Missing PesaPal credentials");
      return new Response(JSON.stringify({ success: false, error: "Missing PesaPal credentials" }), { status: 500, headers: corsHeaders });
    }

    // 1. Get access token
    const tokenRes = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });
    console.log("PesaPal token response status:", tokenRes.status);
    const tokenText = await tokenRes.text();
    console.log("PesaPal token raw response:", tokenText);
    let token;
    try {
      token = JSON.parse(tokenText).token;
    } catch (e) {
      console.error("Failed to parse token response as JSON:", e);
      return new Response(JSON.stringify({ success: false, error: "Invalid token response from PesaPal", details: tokenText }), { status: 500, headers: corsHeaders });
    }
    if (!tokenRes.ok) {
      console.error("PesaPal token error:", tokenText);
      return new Response(JSON.stringify({ success: false, error: tokenText }), { status: 500, headers: corsHeaders });
    }
    console.log("Received PesaPal token:", token);

    // 2. Initiate payment
    const payload = {
      id: reference,
      currency: "KES",
      amount,
      description,
      callback_url: callbackUrl,
      notification_id: reference,
      billing_address: {
        email_address: "user@betwise.com",
        phone_number: phoneNumber,
        country_code: "KE",
        first_name: "BetWise",
        last_name: "User",
      },
    };
    console.log("Sending payment payload:", payload);

    const paymentRes = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    console.log("PesaPal payment response status:", paymentRes.status);
    const paymentText = await paymentRes.text();
    console.log("PesaPal payment raw response:", paymentText);
    let data;
    try {
      data = JSON.parse(paymentText);
    } catch (e) {
      console.error("Failed to parse payment response as JSON:", e);
      return new Response(JSON.stringify({ success: false, error: "Invalid payment response from PesaPal", details: paymentText }), { status: 500, headers: corsHeaders });
    }
    if (!paymentRes.ok) {
      console.error("PesaPal payment error:", paymentText);
      return new Response(JSON.stringify({ success: false, error: paymentText }), { status: 500, headers: corsHeaders });
    }
    console.log("PesaPal payment response data:", data);
    return new Response(JSON.stringify({
      success: true,
      transactionId: data.order_tracking_id,
      checkoutUrl: data.redirect_url,
    }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("Edge Function error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: corsHeaders });
  }
});

/* To invoke locally:

  1. Run `supabase start` (see: https://supabase.com/docs/reference/cli/supabase-start)
  2. Make an HTTP request:

  curl -i --location --request POST 'http://127.0.0.1:54321/functions/v1/pesapal-payment' \
    --header 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZS1kZW1vIiwicm9sZSI6ImFub24iLCJleHAiOjE5ODM4MTI5OTZ9.CRXP1A7WOeoJeXxjNni43kdQwgnWNReilDMblYTn_I0' \
    --header 'Content-Type: application/json' \
    --data '{"name":"Functions"}'

*/
