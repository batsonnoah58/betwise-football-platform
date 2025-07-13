const fetch = require('node-fetch');

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amount, phoneNumber, reference, description, callbackUrl } = JSON.parse(event.body);

  const consumerKey = process.env.PESAPAL_CONSUMER_KEY;
  const consumerSecret = process.env.PESAPAL_CONSUMER_SECRET;
  const baseUrl = process.env.PESAPAL_API_BASE_URL;

  // 1. Get access token
  const tokenRes = await fetch(`${baseUrl}/api/Auth/RequestToken`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      consumer_key: consumerKey,
      consumer_secret: consumerSecret,
    }),
  });

  const tokenText = await tokenRes.text();
  let tokenData;
  try {
    tokenData = JSON.parse(tokenText);
  } catch {
    return { statusCode: 500, body: JSON.stringify({ error: "Invalid JSON from Pesapal", raw: tokenText }) };
  }
  if (!tokenRes.ok || !tokenData.token) {
    return { statusCode: 500, body: JSON.stringify({ error: tokenData }) };
  }
  const token = tokenData.token;

  // 2. Initiate payment (adjust payload as per Pesapal docs)
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
    return { statusCode: 500, body: JSON.stringify({ error: paymentData }) };
  }

  return {
    statusCode: 200,
    body: JSON.stringify({
      transactionId: paymentData.order_tracking_id,
      checkoutUrl: paymentData.redirect_url,
    }),
  };
}; 