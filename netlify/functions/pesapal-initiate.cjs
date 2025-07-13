const fetch = require('node-fetch');

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
    const { amount, phoneNumber, reference, description, callbackUrl } = body;

    // Get PesaPal credentials from environment variables
    const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
    const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
    const environment = process.env.PESAPAL_ENVIRONMENT || "sandbox";
    const baseUrl = environment === "live"
      ? "https://api.pesapal.com"
      : "https://api.pesapal.com/sandbox";

    // 1. Get access token
    const tokenRes = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        consumer_key: consumerKey,
        consumer_secret: consumerSecret,
      }),
    });
    const tokenData = await tokenRes.json();
    if (!tokenRes.ok || !tokenData.token) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: tokenData }),
      };
    }
    const token = tokenData.token;

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

    const paymentRes = await fetch(`${baseUrl}/api/Transactions/SubmitOrderRequest`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    });
    const paymentData = await paymentRes.json();
    if (!paymentRes.ok) {
      return {
        statusCode: 500,
        body: JSON.stringify({ success: false, error: paymentData }),
      };
    }

    return {
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify({
        success: true,
        transactionId: paymentData.order_tracking_id,
        checkoutUrl: paymentData.redirect_url,
      }),
    };
  } catch (err) {
    console.error("PesaPal initiate error:", err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: String(err) }),
    };
  }
}; 