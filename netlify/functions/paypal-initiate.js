const fetch = require('node-fetch');

const PAYPAL_CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const PAYPAL_SECRET = process.env.PAYPAL_SECRET;
const PAYPAL_API = 'https://api-m.sandbox.paypal.com'; // Use 'https://api-m.paypal.com' for live

async function getAccessToken() {
  const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
    method: 'POST',
    headers: {
      'Authorization': 'Basic ' + Buffer.from(`${PAYPAL_CLIENT_ID}:${PAYPAL_SECRET}`).toString('base64'),
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: 'grant_type=client_credentials'
  });
  const data = await res.json();
  return data.access_token;
}

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  const { amount, currency, return_url, cancel_url } = JSON.parse(event.body);

  try {
    const accessToken = await getAccessToken();

    // Create PayPal order
    const orderRes = await fetch(`${PAYPAL_API}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency || 'USD',
            value: amount
          }
        }],
        application_context: {
          return_url,
          cancel_url
        }
      })
    });

    const orderData = await orderRes.json();
    if (!orderRes.ok) {
      return { statusCode: 500, body: JSON.stringify({ error: orderData }) };
    }

    // Find approval link
    const approvalLink = orderData.links.find(link => link.rel === 'approve').href;

    return {
      statusCode: 200,
      body: JSON.stringify({ id: orderData.id, approvalLink })
    };
  } catch (err) {
    return { statusCode: 500, body: JSON.stringify({ error: err.message }) };
  }
}; 