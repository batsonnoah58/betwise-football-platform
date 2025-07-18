// Follow this setup guide to integrate the Deno language server with your editor:
// https://deno.land/manual/getting_started/setup_your_environment
// This enables autocomplete, go to definition, etc.

// Setup type definitions for built-in Supabase Runtime APIs
import "jsr:@supabase/functions-js/edge-runtime.d.ts"

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const allowedOrigins = [
  "https://bet-wise.netlify.app",
  "http://localhost:5173"
];

function getCORSHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const corsOrigin = allowedOrigins.includes(origin) ? origin : allowedOrigins[0];
  return {
    "Access-Control-Allow-Origin": corsOrigin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization, apikey, x-client-info",
    "Access-Control-Max-Age": "86400",
  };
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: getCORSHeaders(req),
    });
  }

  if (req.method !== "POST") {
    return new Response("Method Not Allowed", { status: 405, headers: getCORSHeaders(req) });
  }

  const { amount, currency, return_url, cancel_url } = await req.json();

  const PAYPAL_CLIENT_ID = Deno.env.get("PAYPAL_CLIENT_ID");
  const PAYPAL_SECRET = Deno.env.get("PAYPAL_SECRET");
  const PAYPAL_API = "https://api-m.sandbox.paypal.com";

  // Get access token
  const tokenRes = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Authorization":
        "Basic " + btoa(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  const tokenData = await tokenRes.json();
  if (!tokenRes.ok || !tokenData.access_token) {
    return new Response(
      JSON.stringify({ error: tokenData }),
      { status: 500, headers: { ...getCORSHeaders(req), "Content-Type": "application/json" } }
    );
  }
  const accessToken = tokenData.access_token;

  // Create PayPal order
  const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`,
    },
    body: JSON.stringify({
      intent: "CAPTURE",
      purchase_units: [
        {
          amount: {
            currency_code: currency || "USD",
            value: amount,
          },
        },
      ],
      application_context: {
        return_url,
        cancel_url,
      },
    }),
  });
  const orderData = await orderRes.json();
  if (!orderRes.ok) {
    return new Response(
      JSON.stringify({ error: orderData }),
      { status: 500, headers: { ...getCORSHeaders(req), "Content-Type": "application/json" } }
    );
  }

  // Find approval link
  const approvalLink = orderData.links.find((link: any) => link.rel === "approve")?.href;

  return new Response(
    JSON.stringify({ id: orderData.id, approvalLink }),
    { headers: { ...getCORSHeaders(req), "Content-Type": "application/json" } }
  );
});
