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

    // TODO: Verify the IPN (check signature, etc. if PesaPal provides)
    // TODO: Update your database with the payment status

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