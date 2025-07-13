// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("Received PesaPal IPN:", body);

    // Example: Extract transaction details
    const { transaction_id, status, amount, reference } = body;

    // TODO: Verify the IPN (check signature, etc. if PesaPal provides)
    // TODO: Update your database with the payment status

    // Respond with 200 OK to acknowledge receipt
    return new Response(JSON.stringify({ received: true }), { status: 200, headers: corsHeaders });
  } catch (err) {
    console.error("IPN handler error:", err);
    return new Response(JSON.stringify({ success: false, error: String(err) }), { status: 500, headers: corsHeaders });
  }
});
